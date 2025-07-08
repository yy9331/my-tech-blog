-- 通知系统 SQL 模板文件
-- 使用前请替换以下占位符：
-- 1. ADMIN_EMAIL: 管理员邮箱地址
-- 2. ADMIN_GITHUB_USERNAME: 管理员 GitHub 用户名

-- 1. 创建通知表
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES auth.users("id") ON DELETE CASCADE,
    "post_slug" TEXT NOT NULL,
    "post_title" TEXT NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "comment_content" TEXT NOT NULL,
    "commenter_name" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX IF NOT EXISTS "notifications_post_slug_idx" ON "notifications"("post_slug");

-- 3. 启用行级安全策略 (RLS)
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- 4. 创建策略：允许用户查看自己的通知
CREATE POLICY "Allow users to view their own notifications" ON "notifications"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. 创建策略：允许系统创建通知（通过函数）
CREATE POLICY "Allow system to create notifications" ON "notifications"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. 创建策略：允许用户更新自己的通知（标记为已读）
CREATE POLICY "Allow users to update their own notifications" ON "notifications"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. 创建策略：允许用户删除自己的通知
CREATE POLICY "Allow users to delete their own notifications" ON "notifications"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 8. 创建策略：允许管理员删除任何通知
CREATE POLICY "Allow admin to delete any notification" ON "notifications"
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

-- 9. 创建函数来创建通知
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_post_slug TEXT,
    p_post_title TEXT,
    p_comment_id BIGINT,
    p_comment_content TEXT,
    p_commenter_name TEXT
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id,
        post_slug,
        post_title,
        comment_id,
        comment_content,
        commenter_name
    ) VALUES (
        p_user_id,
        p_post_slug,
        p_post_title,
        p_comment_id,
        p_comment_content,
        p_commenter_name
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. 创建函数来标记通知为已读
CREATE OR REPLACE FUNCTION mark_notification_as_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE id = p_notification_id AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 创建函数来标记所有通知为已读
CREATE OR REPLACE FUNCTION mark_all_notifications_as_read()
RETURNS INTEGER AS $$
DECLARE
    affected_rows INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = auth.uid() AND is_read = FALSE;
    
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 创建函数来获取未读通知数量
CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
    count_result INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_result
    FROM notifications
    WHERE user_id = auth.uid() AND is_read = FALSE;
    
    RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. 授予必要的权限
GRANT ALL ON "notifications" TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count TO authenticated;

-- 14. 创建视图来获取通知及其详细信息
CREATE OR REPLACE VIEW notifications_with_details AS
SELECT 
    n.id,
    n.user_id,
    n.post_slug,
    n.post_title,
    n.comment_id,
    n.comment_content,
    n.commenter_name,
    n.is_read,
    n.created_at,
    u.email as user_email,
    u.raw_user_meta_data->>'user_name' as github_username
FROM "notifications" n
JOIN auth.users u ON n.user_id = u.id
ORDER BY n.created_at DESC;

-- 15. 授予视图权限
GRANT SELECT ON notifications_with_details TO authenticated;

-- 使用说明：
-- 1. 将 ADMIN_EMAIL 替换为你的管理员邮箱地址
-- 2. 将 ADMIN_GITHUB_USERNAME 替换为你的 GitHub 用户名
-- 3. 在 Supabase SQL 编辑器中执行此文件
-- 4. 确保你的 .env.local 文件中包含正确的 Supabase 配置

-- 触发器：当有新评论时自动创建通知
-- 注意：这个触发器需要在 comments 表创建后执行
CREATE OR REPLACE FUNCTION create_notification_on_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_slug TEXT;
    post_title TEXT;
    commenter_name TEXT;
    post_owner_id UUID;
BEGIN
    -- 获取文章信息（从 post_slug 字段获取）
    SELECT p.title, p.user_id INTO post_title, post_owner_id
    FROM "Post" p
    WHERE p.slug = NEW.post_slug;
    
    -- 获取评论者信息
    SELECT 
        COALESCE(
            u.raw_user_meta_data->>'full_name',
            u.raw_user_meta_data->>'user_name',
            u.raw_user_meta_data->>'name',
            u.email
        ) INTO commenter_name
    FROM auth.users u
    WHERE u.id = NEW.user_id;
    
    -- 如果评论不是文章作者自己发的，则创建通知
    IF NEW.user_id != post_owner_id THEN
        PERFORM create_notification(
            post_owner_id,
            NEW.post_slug,
            post_title,
            NEW.id,
            NEW.content,
            commenter_name
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器
CREATE TRIGGER trigger_create_notification_on_comment
    AFTER INSERT ON "comments"
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_on_comment(); 