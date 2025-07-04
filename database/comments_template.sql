-- 评论系统 SQL 模板文件
-- 使用前请替换以下占位符：
-- 1. ADMIN_EMAIL: 管理员邮箱地址
-- 2. ADMIN_GITHUB_USERNAME: 管理员 GitHub 用户名

-- 1. 创建评论表
CREATE TABLE IF NOT EXISTS "comments" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "post_id" UUID NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "user_id" UUID NOT NULL REFERENCES auth.users("id") ON DELETE CASCADE,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "comments_post_id_idx" ON "comments"("post_id");
CREATE INDEX IF NOT EXISTS "comments_user_id_idx" ON "comments"("user_id");
CREATE INDEX IF NOT EXISTS "comments_created_at_idx" ON "comments"("created_at");

-- 3. 启用行级安全策略 (RLS)
ALTER TABLE "comments" ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略：允许所有登录用户查看评论
CREATE POLICY "Allow all authenticated users to view comments" ON "comments"
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. 创建策略：允许登录用户创建自己的评论
CREATE POLICY "Allow authenticated users to create their own comments" ON "comments"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- 6. 创建策略：允许用户更新自己的评论
CREATE POLICY "Allow users to update their own comments" ON "comments"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. 创建策略：允许用户删除自己的评论
CREATE POLICY "Allow users to delete their own comments" ON "comments"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. 创建策略：允许管理员删除任何评论
-- 管理员判断条件：邮箱为 ADMIN_EMAIL 或 GitHub 用户名为 ADMIN_GITHUB_USERNAME
CREATE POLICY "Allow admin to delete any comment" ON "comments"
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (
                auth.users.email = 'ADMIN_EMAIL'
                OR (
                    auth.users.raw_user_meta_data->>'user_name' = 'ADMIN_GITHUB_USERNAME'
                    AND auth.users.raw_user_meta_data->>'provider' = 'github'
                )
            )
        )
    );

-- 9. 创建函数来检查是否为管理员
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.users.id = auth.uid()
        AND (
            auth.users.email = 'ADMIN_EMAIL'
            OR (
                auth.users.raw_user_meta_data->>'user_name' = 'ADMIN_GITHUB_USERNAME'
                AND auth.users.raw_user_meta_data->>'provider' = 'github'
            )
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建触发器函数来自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. 创建触发器
CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON "comments"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. 授予必要的权限
GRANT ALL ON "comments" TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 13. 创建视图来获取评论及其用户信息（可选）
CREATE OR REPLACE VIEW comments_with_users AS
SELECT 
    c.id,
    c.post_id,
    c.content,
    c.created_at,
    c.updated_at,
    u.id as user_id,
    u.email,
    u.raw_user_meta_data->>'user_name' as github_username,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    is_admin() as is_admin
FROM "comments" c
JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- 14. 授予视图权限
GRANT SELECT ON comments_with_users TO authenticated;

-- 使用说明：
-- 1. 将 ADMIN_EMAIL 替换为你的管理员邮箱地址
-- 2. 将 ADMIN_GITHUB_USERNAME 替换为你的 GitHub 用户名
-- 3. 在 Supabase SQL 编辑器中执行此文件
-- 4. 确保你的 .env.local 文件中包含正确的 Supabase 配置

-- 添加Post表的github_url字段的SQL迁移示例
ALTER TABLE Post ADD COLUMN github_url text; 