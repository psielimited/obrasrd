-- Priority 3: lead management pipeline and provider inbox security
alter table public.leads
add column if not exists requester_user_id uuid references auth.users(id) on delete set null;

alter table public.leads
add column if not exists estimated_budget text;

alter table public.leads
add column if not exists provider_reply text;

alter table public.leads
add column if not exists contacted_at timestamptz;

alter table public.leads
add column if not exists closed_at timestamptz;

alter table public.leads
drop constraint if exists leads_status_check;

alter table public.leads
add constraint leads_status_check
check (status in ('new', 'contacted', 'qualified', 'closed_won', 'closed_lost'));

create index if not exists leads_provider_id_idx on public.leads(provider_id);
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_requester_user_id_idx on public.leads(requester_user_id);

create or replace function public.set_lead_timestamps()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'contacted' and old.status is distinct from 'contacted' then
    new.contacted_at = now();
  end if;

  if new.status in ('closed_won', 'closed_lost') and old.status is distinct from new.status then
    new.closed_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_status_timestamps on public.leads;
create trigger trg_leads_status_timestamps
before update on public.leads
for each row
execute function public.set_lead_timestamps();

drop policy if exists "Authenticated can manage leads" on public.leads;

create policy "Anyone can submit leads"
on public.leads
for insert
to anon, authenticated
with check (
  requester_user_id is null
  or requester_user_id = auth.uid()
);

create policy "Providers can read own leads"
on public.leads
for select
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = leads.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Providers can update own leads"
on public.leads
for update
to authenticated
using (
  exists (
    select 1
    from public.providers p
    where p.id = leads.provider_id
      and p.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.providers p
    where p.id = leads.provider_id
      and p.owner_user_id = auth.uid()
  )
);

create policy "Requesters can read own leads"
on public.leads
for select
to authenticated
using (requester_user_id = auth.uid());
