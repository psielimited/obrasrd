-- Smoke verification for lead messaging + requester actions.
-- Run in Supabase SQL editor (or psql) after applying migrations.
-- Safe by default: script ends with ROLLBACK.

begin;

-- 1) Schema/function/trigger presence checks.
do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'lead_messages'
  ) then
    raise exception 'Missing table public.lead_messages';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'send_lead_message'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.send_lead_message(uuid, text)';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'mark_my_lead_thread_read'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.mark_my_lead_thread_read(uuid)';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'update_my_lead_state'
      and pronamespace = 'public'::regnamespace
  ) then
    raise exception 'Missing function public.update_my_lead_state(uuid, text)';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_sync_lead_last_message'
  ) then
    raise exception 'Missing trigger trg_sync_lead_last_message';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgname = 'trg_notify_on_lead_message'
  ) then
    raise exception 'Missing trigger trg_notify_on_lead_message';
  end if;
end
$$;

-- 2) Messaging flow check:
-- requester sends message -> lead sync fields update -> provider gets notification
-- -> provider marks thread as read.
do $$
declare
  v_lead_id uuid;
  v_requester_user_id uuid;
  v_provider_owner_user_id uuid;
  v_message_id uuid;
  v_notification_id uuid;
begin
  select l.id, l.requester_user_id, p.owner_user_id
    into v_lead_id, v_requester_user_id, v_provider_owner_user_id
  from public.leads l
  join public.providers p on p.id = l.provider_id
  where l.requester_user_id is not null
    and p.owner_user_id is not null
  order by l.created_at desc
  limit 1;

  if v_lead_id is null then
    raise notice 'SKIP messaging roundtrip: no lead found with requester_user_id + provider.owner_user_id';
    return;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_requester_user_id::text, true);

  select id
    into v_message_id
  from public.send_lead_message(
    v_lead_id,
    'SMOKE: requester message verification'
  );

  if v_message_id is null then
    raise exception 'send_lead_message did not return message row';
  end if;

  if not exists (
    select 1
    from public.leads
    where id = v_lead_id
      and last_message_at is not null
      and last_message_preview like 'SMOKE:%'
  ) then
    raise exception 'Lead sync fields were not updated by message trigger';
  end if;

  select n.id
    into v_notification_id
  from public.notifications n
  where n.lead_id = v_lead_id
    and n.type = 'lead_message'
    and n.metadata ->> 'sender_role' = 'requester'
  order by n.created_at desc
  limit 1;

  if v_notification_id is null then
    raise exception 'Lead message notification not generated for provider';
  end if;

  perform set_config('request.jwt.claim.sub', v_provider_owner_user_id::text, true);
  perform public.mark_my_lead_thread_read(v_lead_id);

  if not exists (
    select 1
    from public.leads
    where id = v_lead_id
      and provider_last_read_at is not null
  ) then
    raise exception 'mark_my_lead_thread_read did not set provider_last_read_at';
  end if;
end
$$;

-- 3) Requester state lifecycle check:
-- requester can archive and reactivate own lead via RPC.
do $$
declare
  v_lead_id uuid;
  v_requester_user_id uuid;
begin
  select l.id, l.requester_user_id
    into v_lead_id, v_requester_user_id
  from public.leads l
  where l.requester_user_id is not null
  order by l.created_at desc
  limit 1;

  if v_lead_id is null then
    raise notice 'SKIP requester state lifecycle: no lead found with requester_user_id';
    return;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_requester_user_id::text, true);

  perform public.update_my_lead_state(v_lead_id, 'archived');
  if not exists (
    select 1
    from public.leads
    where id = v_lead_id
      and requester_state = 'archived'
      and requester_archived_at is not null
  ) then
    raise exception 'update_my_lead_state failed to archive lead';
  end if;

  perform public.update_my_lead_state(v_lead_id, 'active');
  if not exists (
    select 1
    from public.leads
    where id = v_lead_id
      and requester_state = 'active'
  ) then
    raise exception 'update_my_lead_state failed to reactivate lead';
  end if;
end
$$;

-- Revert smoke data changes by default.
rollback;

-- If you intentionally want to keep the smoke inserts/updates, replace ROLLBACK with COMMIT.
