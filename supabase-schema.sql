-- Supabase SQL Editor에서 실행하세요
-- 1. projects 테이블 생성
create table if not exists projects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  status text not null default 'idea' check (status in ('idea', 'in-progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  tags text[] not null default '{}',
  due_date text,
  progress integer not null default 0,
  checklist jsonb not null default '[]',
  memo text not null default '',
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. user_id 인덱스 (조회 성능)
create index if not exists idx_projects_user_id on projects(user_id);

-- 3. RLS 활성화 (본인 데이터만 접근)
alter table projects enable row level security;

-- 4. RLS 정책: 본인 데이터만 SELECT
create policy "Users can view own projects"
  on projects for select
  using (auth.uid() = user_id);

-- 5. RLS 정책: 본인만 INSERT
create policy "Users can insert own projects"
  on projects for insert
  with check (auth.uid() = user_id);

-- 6. RLS 정책: 본인만 UPDATE
create policy "Users can update own projects"
  on projects for update
  using (auth.uid() = user_id);

-- 7. RLS 정책: 본인만 DELETE
create policy "Users can delete own projects"
  on projects for delete
  using (auth.uid() = user_id);

-- 8. updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on projects
  for each row
  execute function update_updated_at();
