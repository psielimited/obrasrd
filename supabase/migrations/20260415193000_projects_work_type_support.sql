-- First-class work type support for project records (additive).
-- Keeps compatibility: nullable column so existing records remain valid.

alter table public.projects
add column if not exists work_type_id bigint references public.work_types(id) on delete set null;

create index if not exists projects_work_type_id_idx on public.projects(work_type_id);
