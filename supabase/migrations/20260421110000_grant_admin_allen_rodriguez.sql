-- Grant admin access for moderation workflow to a specific account.
-- Rollback notes:
-- 1) update public.user_profiles
--      set role = 'buyer'
--    where user_id = (
--      select id from auth.users where lower(email) = lower('allen.rodriguez@gmail.com') limit 1
--    );

do $$
declare
  v_user_id uuid;
begin
  select u.id
    into v_user_id
  from auth.users u
  where lower(u.email) = lower('allen.rodriguez@gmail.com')
  limit 1;

  if v_user_id is null then
    raise notice 'No auth.users row found for allen.rodriguez@gmail.com. Ensure the user has signed up first.';
    return;
  end if;

  insert into public.user_profiles (user_id, display_name, role)
  values (v_user_id, split_part('allen.rodriguez@gmail.com', '@', 1), 'admin')
  on conflict (user_id) do update
    set role = 'admin';
end;
$$;
