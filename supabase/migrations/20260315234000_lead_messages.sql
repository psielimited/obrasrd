-- Lead messaging MVP: structured conversation per lead
create table if not exists public.lead_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  sender_role text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint lead_messages_sender_role_check check (sender_role in ('provider', 'requester')),
  constraint lead_messages_message_len_check check (char_length(trim(message)) between 1 and 2000)
);

create index if not exists lead_messages_lead_created_idx on public.lead_messages(lead_id, created_at desc);

alter table public.leads add column if not exists last_message_at timestamptz;
alter table public.leads add column if not exists last_message_preview text;
alter table public.leads add column if not exists provider_last_read_at timestamptz;
alter table public.leads add column if not exists requester_last_read_at timestamptz;

alter table public.lead_messages enable row level security;

drop policy if exists "Participants can read lead messages" on public.lead_messages;
create policy "Participants can read lead messages"
on public.lead_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.leads l
    left join public.providers p on p.id = l.provider_id
    where l.id = lead_messages.lead_id
      and (
        l.requester_user_id = auth.uid()
        or p.owner_user_id = auth.uid()
      )
  )
);

create or replace function public.send_lead_message(
  p_lead_id uuid,
  p_message text
)
returns public.lead_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads;
  v_sender_role text;
  v_provider_owner uuid;
  v_row public.lead_messages;
begin
  if trim(coalesce(p_message, '')) = '' then
    raise exception 'Mensaje vacio';
  end if;

  select l.*
    into v_lead
  from public.leads l
  where l.id = p_lead_id;

  if not found then
    raise exception 'Lead no encontrado';
  end if;

  select owner_user_id
    into v_provider_owner
  from public.providers
  where id = v_lead.provider_id;

  if v_lead.requester_user_id = auth.uid() then
    v_sender_role := 'requester';
  elsif v_provider_owner = auth.uid() then
    v_sender_role := 'provider';
  else
    raise exception 'No autorizado';
  end if;

  insert into public.lead_messages (lead_id, sender_user_id, sender_role, message)
  values (p_lead_id, auth.uid(), v_sender_role, trim(p_message))
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.mark_my_lead_thread_read(
  p_lead_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads;
  v_provider_owner uuid;
begin
  select l.*
    into v_lead
  from public.leads l
  where l.id = p_lead_id;

  if not found then
    raise exception 'Lead no encontrado';
  end if;

  select owner_user_id
    into v_provider_owner
  from public.providers
  where id = v_lead.provider_id;

  if v_lead.requester_user_id = auth.uid() then
    update public.leads
    set requester_last_read_at = now(), updated_at = now()
    where id = p_lead_id;
  elsif v_provider_owner = auth.uid() then
    update public.leads
    set provider_last_read_at = now(), updated_at = now()
    where id = p_lead_id;
  else
    raise exception 'No autorizado';
  end if;
end;
$$;

create or replace function public.sync_lead_last_message()
returns trigger
language plpgsql
as $$
begin
  update public.leads
  set
    last_message_at = new.created_at,
    last_message_preview = left(new.message, 180),
    provider_last_read_at = case when new.sender_role = 'provider' then new.created_at else provider_last_read_at end,
    requester_last_read_at = case when new.sender_role = 'requester' then new.created_at else requester_last_read_at end,
    updated_at = now()
  where id = new.lead_id;

  return new;
end;
$$;

drop trigger if exists trg_sync_lead_last_message on public.lead_messages;
create trigger trg_sync_lead_last_message
after insert on public.lead_messages
for each row
execute function public.sync_lead_last_message();

alter table public.notifications
drop constraint if exists notifications_type_check;

alter table public.notifications
add constraint notifications_type_check
check (type in ('lead_new', 'lead_status', 'lead_reply', 'lead_message'));

create or replace function public.notify_on_lead_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lead public.leads;
  v_provider_owner uuid;
  v_recipient uuid;
begin
  select *
    into v_lead
  from public.leads
  where id = new.lead_id;

  if not found then
    return new;
  end if;

  select owner_user_id
    into v_provider_owner
  from public.providers
  where id = v_lead.provider_id;

  if new.sender_role = 'provider' then
    v_recipient := v_lead.requester_user_id;
  else
    v_recipient := v_provider_owner;
  end if;

  if v_recipient is not null then
    insert into public.notifications (
      recipient_user_id,
      type,
      title,
      body,
      lead_id,
      metadata
    )
    values (
      v_recipient,
      'lead_message',
      'Nuevo mensaje en tu solicitud',
      left(new.message, 200),
      new.lead_id,
      jsonb_build_object('sender_role', new.sender_role)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_notify_on_lead_message on public.lead_messages;
create trigger trg_notify_on_lead_message
after insert on public.lead_messages
for each row
execute function public.notify_on_lead_message();

revoke all on function public.send_lead_message(uuid, text) from public, anon;
revoke all on function public.mark_my_lead_thread_read(uuid) from public, anon;
grant execute on function public.send_lead_message(uuid, text) to authenticated;
grant execute on function public.mark_my_lead_thread_read(uuid) to authenticated;
