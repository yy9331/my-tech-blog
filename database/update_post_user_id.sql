-- 更新现有文章的 user_id 字段
-- 请将 '你的用户ID' 替换为你的实际用户ID

-- 查看当前 Post 表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Post' 
ORDER BY ordinal_position;

-- 查看现有文章数据
SELECT slug, title, author, user_id 
FROM "Post" 
ORDER BY created_at DESC;

-- 更新所有现有文章的 user_id 字段
-- 请将 '你的用户ID' 替换为你的实际用户ID
UPDATE "Post" 
SET user_id = '你的用户ID' 
WHERE user_id IS NULL;

-- 验证更新结果
SELECT slug, title, author, user_id 
FROM "Post" 
ORDER BY created_at DESC;

-- 如果需要为不同作者设置不同的用户ID，可以使用以下方式：
-- UPDATE "Post" 
-- SET user_id = '用户ID1' 
-- WHERE author = '作者名1' AND user_id IS NULL;

-- UPDATE "Post" 
-- SET user_id = '用户ID2' 
-- WHERE author = '作者名2' AND user_id IS NULL; 