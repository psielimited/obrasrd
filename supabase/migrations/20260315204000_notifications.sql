-- Priority 3.1: in-app notifications for lead events
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  lead_id uuid references public.leads(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_type_check check (type in ('lead_new', 'lead_status', 'lead_reply'))
);

create index if not exists notifications_recipient_created_idx
  on public.notifications(recipient_user_id, created_at desc);

create index if not exists notifications_recipient_read_idx
  on public.notifications(recipient_user_id, read_at);

alter table public.notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.notifications;
create policy "Users can read own notifications"
on public.notifications
for select
to authenticated
using (recipient_user_id = auth.uid());

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
on public.notifications
for update
to authenticated
using (recipient_user_id = auth.uid())
with check (recipient_user_id = auth.uid());

create or replace function public.notify_on_lead_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_provider_owner uuid;
  v_status_label text;
begin
  if tg_op = 'INSERT' then
    select p.owner_user_id
      into v_provider_owner
    from public.providers p
    where p.id = new.provider_id;

    if v_provider_owner is not null then
      insert into public.notifications (
        recipient_user_id,
        type,
        title,
        body,
        lead_id,
        metadata
      )
      values (
        v_provider_owner,
        'lead_new',
        'Nuevo lead recibido',
        coalesce(new.requester_name, 'Nuevo solicitante') || ' te envio una solicitud de cotizacion.',
        new.id,
        jsonb_build_object('status', new.status)
      );
    end if;

    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.requester_user_id is not null and new.status is distinct from old.status then
      v_status_label := case new.status
        when 'new' then 'Nuevo'
        when 'contacted' then 'Contactado'
        when 'qualified' then 'Calificado'
        when 'closed_won' then 'Cerrado - Ganado'
        when 'closed_lost' then 'Cerrado - Perdido'
        else new.status
      end;

      insert into public.notifications (
        recipient_user_id,
        type,
        title,
        body,
        lead_id,
        metadata
      )
      values (
        new.requester_user_id,
        'lead_status',
        'Actualizacion de tu solicitud',
        'Tu solicitud ahora esta en estado: ' || v_status_label || '.',
        new.id,
        jsonb_build_object('status', new.status)
      );
    end if;

    if new.requester_user_id is not null
      and coalesce(new.provider_reply, '') <> coalesce(old.provider_reply, '')
      and coalesce(new.provider_reply, '') <> '' then
      insert into public.notifications (
        recipient_user_id,
        type,
        title,
        body,
        lead_id,
        metadata
      )
      values (
        new.requester_user_id,
        'lead_reply',
        'Nuevo mensaje del proveedor',
        left(new.provider_reply, 200),
        new.id,
        jsonb_build_object('status', new.status)
      );
    end if;

    return new;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_lead_events on public.leads;
create trigger trg_notify_on_lead_events
after insert or update on public.leads
for each row
execute function public.notify_on_lead_events();
