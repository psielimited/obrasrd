-- Service posts moderation workflow (admin queue + owner status visibility)
-- Rollback notes:
-- 1) DROP POLICY IF EXISTS "Admins can read all service posts" ON public.service_posts;
-- 2) DROP POLICY IF EXISTS "Admins can moderate service posts" ON public.service_posts;
-- 3) ALTER TABLE public.service_posts
--      DROP COLUMN IF EXISTS review_note,
--      DROP COLUMN IF EXISTS reviewed_by_user_id,
--      DROP COLUMN IF EXISTS reviewed_at;
-- 4) DROP INDEX IF EXISTS service_posts_status_created_at_idx;

alter table public.service_posts
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by_user_id uuid references auth.users(id) on delete set null,
  add column if not exists review_note text;

create index if not exists service_posts_status_created_at_idx
  on public.service_posts(status, created_at desc);

create policy "Admins can read all service posts"
on public.service_posts
for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles up
    where up.user_id = auth.uid()
      and up.role = 'admin'
  )
);

create policy "Admins can moderate service posts"
on public.service_posts
for update
to authenticated
using (
  exists (
    select 1
    from public.user_profiles up
    where up.user_id = auth.uid()
      and up.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.user_id = auth.uid()
      and up.role = 'admin'
  )
  and (
    (status = 'pending' and reviewed_at is null and reviewed_by_user_id is null)
    or (status in ('approved', 'rejected') and reviewed_at is not null and reviewed_by_user_id = auth.uid())
  )
);
