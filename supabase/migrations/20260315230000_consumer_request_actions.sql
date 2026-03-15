-- Consumer capability: requester-side lifecycle for submitted leads
alter table public.leads
add column if not exists requester_state text not null default 'active';

alter table public.leads
add column if not exists requester_cancelled_at timestamptz;

alter table public.leads
add column if not exists requester_archived_at timestamptz;

alter table public.leads
drop constraint if exists leads_requester_state_check;

alter table public.leads
add constraint leads_requester_state_check
check (requester_state in ('active', 'cancelled', 'archived'));

create or replace function public.set_requester_state_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.requester_state = 'cancelled' and old.requester_state is distinct from 'cancelled' then
    new.requester_cancelled_at = now();
  end if;

  if new.requester_state = 'archived' and old.requester_state is distinct from 'archived' then
    new.requester_archived_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_requester_state_timestamps on public.leads;
create trigger trg_leads_requester_state_timestamps
before update on public.leads
for each row
execute function public.set_requester_state_timestamps();

create or replace function public.update_my_lead_state(
  p_lead_id uuid,
  p_requester_state text
)
returns public.leads
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.leads;
begin
  if p_requester_state not in ('active', 'cancelled', 'archived') then
    raise exception 'Estado de solicitud invalido';
  end if;

  update public.leads
  set requester_state = p_requester_state,
      updated_at = now()
  where id = p_lead_id
    and requester_user_id = auth.uid()
  returning * into v_row;

  if not found then
    raise exception 'No autorizado o lead no encontrado';
  end if;

  return v_row;
end;
$$;

revoke all on function public.update_my_lead_state(uuid, text) from public, anon;
grant execute on function public.update_my_lead_state(uuid, text) to authenticated;
