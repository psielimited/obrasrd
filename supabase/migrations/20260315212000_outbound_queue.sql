-- Priority 3.2: outbound delivery queue for email/whatsapp notifications
alter table public.user_profiles
add column if not exists notification_email_enabled boolean not null default true;

alter table public.user_profiles
add column if not exists notification_whatsapp_enabled boolean not null default false;

create table if not exists public.outbound_messages (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  recipient text not null,
  subject text,
  body text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  attempts int not null default 0,
  max_attempts int not null default 5,
  next_attempt_at timestamptz not null default now(),
  sent_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint outbound_messages_channel_check check (channel in ('email', 'whatsapp')),
  constraint outbound_messages_status_check check (status in ('queued', 'processing', 'sent', 'failed', 'gave_up')),
  constraint outbound_messages_unique_notification_channel unique (notification_id, channel)
);

create trigger trg_outbound_messages_updated_at
before update on public.outbound_messages
for each row
execute function public.set_updated_at();

create index if not exists outbound_messages_status_next_attempt_idx
  on public.outbound_messages(status, next_attempt_at);

create index if not exists outbound_messages_recipient_idx
  on public.outbound_messages(recipient_user_id, created_at desc);

alter table public.outbound_messages enable row level security;

drop policy if exists "Users can read own outbound messages" on public.outbound_messages;
create policy "Users can read own outbound messages"
on public.outbound_messages
for select
to authenticated
using (recipient_user_id = auth.uid());

create or replace function public.enqueue_outbound_for_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile record;
  v_email text;
begin
  select
    up.notification_email_enabled,
    up.notification_whatsapp_enabled,
    up.phone
  into v_profile
  from public.user_profiles up
  where up.user_id = new.recipient_user_id;

  select au.email
  into v_email
  from auth.users au
  where au.id = new.recipient_user_id;

  if coalesce(v_profile.notification_email_enabled, true) and v_email is not null then
    insert into public.outbound_messages (
      notification_id,
      recipient_user_id,
      channel,
      recipient,
      subject,
      body,
      payload
    )
    values (
      new.id,
      new.recipient_user_id,
      'email',
      v_email,
      new.title,
      new.body,
      jsonb_build_object('notification_type', new.type, 'lead_id', new.lead_id)
    )
    on conflict (notification_id, channel) do nothing;
  end if;

  if coalesce(v_profile.notification_whatsapp_enabled, false)
    and coalesce(v_profile.phone, '') <> '' then
    insert into public.outbound_messages (
      notification_id,
      recipient_user_id,
      channel,
      recipient,
      subject,
      body,
      payload
    )
    values (
      new.id,
      new.recipient_user_id,
      'whatsapp',
      v_profile.phone,
      new.title,
      new.body,
      jsonb_build_object('notification_type', new.type, 'lead_id', new.lead_id)
    )
    on conflict (notification_id, channel) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enqueue_outbound_on_notification on public.notifications;
create trigger trg_enqueue_outbound_on_notification
after insert on public.notifications
for each row
execute function public.enqueue_outbound_for_notification();

create or replace function public.dequeue_outbound_messages(max_items int default 25)
returns setof public.outbound_messages
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with picked as (
    select om.id
    from public.outbound_messages om
    where om.status in ('queued', 'failed')
      and om.next_attempt_at <= now()
      and om.attempts < om.max_attempts
    order by om.next_attempt_at asc, om.created_at asc
    limit greatest(max_items, 1)
    for update skip locked
  ), marked as (
    update public.outbound_messages om
    set
      status = 'processing',
      attempts = om.attempts + 1,
      updated_at = now()
    where om.id in (select id from picked)
    returning om.*
  )
  select * from marked;
end;
$$;

create or replace function public.complete_outbound_message(
  p_id uuid,
  p_success boolean,
  p_error text default null,
  p_retry_after_seconds int default 300
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.outbound_messages
  set
    status = case
      when p_success then 'sent'
      when attempts >= max_attempts then 'gave_up'
      else 'failed'
    end,
    sent_at = case when p_success then now() else sent_at end,
    last_error = case when p_success then null else p_error end,
    next_attempt_at = case
      when p_success then next_attempt_at
      when attempts >= max_attempts then next_attempt_at
      else now() + make_interval(secs => greatest(p_retry_after_seconds, 30))
    end,
    updated_at = now()
  where id = p_id;
end;
$$;

revoke all on function public.dequeue_outbound_messages(int) from public, anon, authenticated;
revoke all on function public.complete_outbound_message(uuid, boolean, text, int) from public, anon, authenticated;
grant execute on function public.dequeue_outbound_messages(int) to service_role;
grant execute on function public.complete_outbound_message(uuid, boolean, text, int) to service_role;
