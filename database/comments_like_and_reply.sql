-- 1. 新建点赞表
create table if not exists comment_likes (
  id bigserial primary key,
  comment_id bigint references comments(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz default now(),
  unique (comment_id, user_id)
);

-- 2. 给 comments 表增加 parent_id 字段（允许为 null）
alter table comments add column if not exists parent_id bigint references comments(id) on delete cascade;