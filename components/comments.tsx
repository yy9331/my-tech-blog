'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast/toast-context';

interface Comment {
  id: number;
  post_slug: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
  is_admin?: boolean;
  parent_id?: number | null;
  like_count?: number;
  liked_by_me?: boolean;
  replies?: Comment[];
}

interface CommentsProps {
  postSlug: string;
}

export default function Comments({ postSlug }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const { isLoggedIn, user, userName, userAvatar } = useAuth();
  const { showToast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [replyBoxOpen, setReplyBoxOpen] = useState<{ [key: number]: boolean }>({});
  const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
  const [likeLoading, setLikeLoading] = useState<{ [key: number]: boolean }>({});

  // 检查是否为管理员
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdminUser(false);
        return;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // 检查用户邮箱是否在允许列表中
        const allowedEmails = ['yuyi.gz@163.com', 'yuyigz@gmail.com'];
        const isAllowedEmail = allowedEmails.includes(session.user.email || '');
        
        // 检查GitHub用户名是否在允许列表中（与数据库策略保持一致）
        const allowedGitHubUsers = ['yy9331'];
        const githubUsername = session.user.user_metadata?.user_name || 
                              session.user.user_metadata?.preferred_username;
        const isAllowedGitHub = githubUsername && allowedGitHubUsers.includes(githubUsername);
        
        const adminStatus = isAllowedEmail || isAllowedGitHub;
        setIsAdminUser(adminStatus);
        
        // 调试信息
        console.log('User admin check:', {
          email: session.user.email,
          githubUsername,
          isAllowedEmail,
          isAllowedGitHub,
          adminStatus,
          userMetadata: session.user.user_metadata
        });
      }
    };

    checkAdminStatus();
  }, [user]);

  // 加载评论及点赞信息（递归组装）
  useEffect(() => {
    const loadComments = async () => {
      try {
        const supabase = createClient();
        // 查询所有评论
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select('*')
          .eq('post_slug', postSlug)
          .order('created_at', { ascending: true });
        if (error) throw error;
        // 查询所有点赞
        const likesMap: Record<number, number> = {};
        const likedMap: Record<number, boolean> = {};
        if (user) {
          // 查询当前用户点赞
          const { data: myLikes } = await supabase
            .from('comment_likes')
            .select('comment_id')
            .eq('user_id', user.id);
          if (myLikes) {
            myLikes.forEach(like => {
              likedMap[like.comment_id] = true;
            });
          }
        }
        // 查询所有评论的点赞数
        const { data: likeCounts } = await supabase
          .from('comment_likes')
          .select('comment_id, count:comment_id')
          .in('comment_id', commentsData.map(c => c.id));
        if (likeCounts) {
          likeCounts.forEach(lc => {
            likesMap[lc.comment_id] = lc.count;
          });
        }
        // 组装评论树
        const commentMap: Record<number, Comment> = {};
        commentsData.forEach((c: Comment) => {
          commentMap[c.id] = {
            ...c,
            like_count: likesMap[c.id] || 0,
            liked_by_me: likedMap[c.id] || false,
            replies: [],
          };
        });
        const rootComments: Comment[] = [];
        commentsData.forEach((c: Comment) => {
          if (c.parent_id) {
            commentMap[c.parent_id]?.replies?.push(commentMap[c.id]);
          } else {
            rootComments.push(commentMap[c.id]);
          }
        });
        setComments(rootComments);
      } catch (error) {
        console.error('Error loading comments:', error);
        showToast('加载评论失败', 'error');
      } finally {
        setCommentsLoading(false);
      }
    };
    loadComments();
  }, [postSlug, user, showToast]);

  // 递归更新评论树中的点赞状态
  const updateLikeInTree = (comments: Comment[], commentId: number, likeChange: number, likedByMe: boolean): Comment[] => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          like_count: (comment.like_count || 0) + likeChange,
          liked_by_me: likedByMe
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateLikeInTree(comment.replies, commentId, likeChange, likedByMe)
        };
      }
      return comment;
    });
  };

  // 递归插入新回复到评论树
  const insertReplyInTree = (comments: Comment[], parentId: number, newReply: Comment): Comment[] => {
    return comments.map(comment => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), newReply]
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: insertReplyInTree(comment.replies, parentId, newReply)
        };
      }
      return comment;
    });
  };

  // 递归插入新评论到根级别
  const insertNewComment = (comments: Comment[], newComment: Comment): Comment[] => {
    return [...comments, newComment];
  };

  // GitHub OAuth 登录
  const handleGitHubLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('GitHub login error:', error);
      showToast('GitHub登录失败', 'error');
    }
  };

  // 提交评论
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      showToast('请输入评论内容', 'error');
      return;
    }

    if (!isLoggedIn || !user) {
      showToast('请先登录', 'error');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: newCommentData, error } = await supabase
        .from('comments')
        .insert({
          post_slug: postSlug,
          user_id: user.id,
          user_name: userName || '匿名用户',
          user_avatar: userAvatar,
          content: newComment.trim(),
          is_admin: isAdminUser
        })
        .select()
        .single();

      if (error) throw error;

      // 立即更新本地状态
      const commentWithMetadata: Comment = {
        ...newCommentData,
        like_count: 0,
        liked_by_me: false,
        replies: []
      };
      
      setComments(prev => insertNewComment(prev, commentWithMetadata));
      setNewComment('');
      showToast('评论发布成功！', 'success');
      
      // 清空输入框并调整高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      showToast('发布评论失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!isAdminUser) {
      showToast('您没有权限删除评论', 'error');
      return;
    }

    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const supabase = createClient();
      
      // 首先检查当前用户会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        showToast('会话验证失败', 'error');
        return;
      }
      
      if (!session) {
        showToast('请重新登录', 'error');
        return;
      }

      console.log('Current user:', session.user);
      console.log('Attempting to delete comment:', commentId);

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      // 递归删除评论及其所有回复
      const removeCommentFromTree = (comments: Comment[], targetId: number): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === targetId) {
            return false;
          }
          if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeCommentFromTree(comment.replies, targetId);
          }
          return true;
        });
      };

      setComments(prev => removeCommentFromTree(prev, commentId));
      showToast('评论删除成功', 'success');
    } catch (error: unknown) {
      console.error('Error deleting comment:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '删除评论失败';
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage += `: ${(error as { message: string }).message}`;
      }
      if (error && typeof error === 'object' && 'details' in error) {
        errorMessage += ` (${(error as { details: string }).details})`;
      }
      
      showToast(errorMessage, 'error');
    }
  };

  // 自动调整文本框高度
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}天前`;
    
    return date.toLocaleDateString('zh-CN');
  };

  // 点赞/取消点赞
  const handleLike = async (commentId: number, liked: boolean) => {
    if (!isLoggedIn || !user) {
      showToast('请先登录', 'error');
      return;
    }

    // 乐观更新：立即更新UI
    const newLikedState = !liked;
    const likeChange = newLikedState ? 1 : -1;
    
    setComments(prev => updateLikeInTree(prev, commentId, likeChange, newLikedState));
    setLikeLoading(l => ({ ...l, [commentId]: true }));

    try {
      const supabase = createClient();
      if (liked) {
        // 取消点赞
        await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      } else {
        // 点赞前先检查是否已点赞，防止并发下重复插入
        const { data: exist } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
          .single();
        if (exist) {
          showToast('你已点赞过', 'info');
          // 回滚乐观更新
          setComments(prev => updateLikeInTree(prev, commentId, -likeChange, liked));
          setLikeLoading(l => ({ ...l, [commentId]: false }));
          return;
        }
        await supabase.from('comment_likes').insert({ comment_id: commentId, user_id: user.id });
      }
    } catch (error) {
      console.error('Like operation failed:', error);
      showToast('操作失败', 'error');
      // 回滚乐观更新
      setComments(prev => updateLikeInTree(prev, commentId, -likeChange, liked));
    } finally {
      setLikeLoading(l => ({ ...l, [commentId]: false }));
    }
  };

  // 回复评论
  const handleReply = async (parentId: number) => {
    const content = replyContent[parentId]?.trim();
    if (!content) {
      showToast('请输入回复内容', 'error');
      return;
    }
    if (!isLoggedIn || !user) {
      showToast('请先登录', 'error');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { data: newReplyData, error } = await supabase
        .from('comments')
        .insert({
          post_slug: postSlug,
          user_id: user.id,
          user_name: userName || '匿名用户',
          user_avatar: userAvatar,
          content,
          is_admin: isAdminUser,
          parent_id: parentId,
        })
        .select()
        .single();

      if (error) throw error;

      // 立即更新本地状态
      const replyWithMetadata: Comment = {
        ...newReplyData,
        like_count: 0,
        liked_by_me: false,
        replies: []
      };

      setComments(prev => insertReplyInTree(prev, parentId, replyWithMetadata));
      setReplyContent(rc => ({ ...rc, [parentId]: '' }));
      setReplyBoxOpen(rb => ({ ...rb, [parentId]: false }));
      showToast('回复成功', 'success');
    } catch (error) {
      console.error('Reply operation failed:', error);
      showToast('回复失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 无限层级递归渲染，但所有非顶级评论只缩进一层
  const renderCommentRecursive = (comment: Comment, commentById: Record<number, Comment>) => {
    const isReply = !!comment.parent_id;
    return (
      <div
        key={comment.id}
        className={`flex gap-4 p-4 bg-muted/30 rounded-lg mt-2${isReply ? ' ml-8' : ''}`}
      >
        {comment.user_avatar && (
          <Image
            src={comment.user_avatar}
            alt={comment.user_name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-foreground">
              {comment.user_name}
              {/* 只有parent_id存在且parent评论不是顶级评论时才显示"> 被回复人" */}
              {comment.parent_id && commentById[comment.parent_id] && commentById[comment.parent_id].parent_id && (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" className="inline mx-1 text-muted-foreground" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="4,2 10,7 4,12" fill="currentColor"/>
                  </svg>
                  <span className="text-sky-500 font-medium">{commentById[comment.parent_id].user_name}</span>
                </>
              )}
            </span>
            {comment.is_admin && (
              <span className="px-2 py-1 text-xs bg-red-600 text-white rounded-full">
                管理员
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">
            {comment.content}
          </p>
          <div className="flex gap-4 mt-2 items-center">
            <button
              className={`text-sm flex items-center gap-1 ${comment.liked_by_me ? 'text-sky-600' : 'text-muted-foreground'} disabled:opacity-50`}
              disabled={likeLoading[comment.id]}
              onClick={() => handleLike(comment.id, comment.liked_by_me || false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
              {comment.liked_by_me ? '已赞' : '点赞'}
              <span>({comment.like_count || 0})</span>
            </button>
            <button
              className="text-sm text-muted-foreground hover:text-sky-600"
              onClick={() => setReplyBoxOpen(rb => ({ ...rb, [comment.id]: !rb[comment.id] }))}
            >
              回复
            </button>
            {isAdminUser && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-sm text-red-500 hover:text-red-700 transition-colors ml-2"
              >
                删除
              </button>
            )}
          </div>
          {/* 回复输入框 */}
          {replyBoxOpen[comment.id] && (
            <div className="mt-2">
              <textarea
                value={replyContent[comment.id] || ''}
                onChange={e => setReplyContent(rc => ({ ...rc, [comment.id]: e.target.value }))}
                placeholder="写下你的回复..."
                className="w-full p-2 border border-border rounded bg-muted text-foreground placeholder-muted-foreground resize-none min-h-[60px]"
              />
              <div className="flex justify-end mt-1">
                <button
                  className="px-4 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 text-sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={loading}
                >
                  {loading ? '回复中...' : '回复'}
                </button>
              </div>
            </div>
          )}
          {/* 递归渲染所有子评论，视觉只缩进一层 */}
          {comment.replies && comment.replies.length > 0 && (
            comment.replies.map(child => renderCommentRecursive(child, commentById))
          )}
        </div>
      </div>
    );
  };

  if (commentsLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-card rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-foreground mb-6">评论区</h3>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-12">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">评论区</h3>
        
        {/* 登录提示 */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-3">请登录后发表评论</p>
            <button
              onClick={handleGitHubLogin}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              使用 GitHub 登录
            </button>
          </div>
        )}

        {/* 评论表单 */}
        {isLoggedIn && (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="flex gap-4 mb-4">
              {userAvatar && (
                <Image
                  src={userAvatar}
                  alt={userName || '用户头像'}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={handleTextareaChange}
                  placeholder="写下你的评论..."
                  className="w-full p-3 border border-border rounded-lg bg-muted text-foreground placeholder-muted-foreground resize-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors min-h-[80px]"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                以 {userName || '匿名用户'} 身份发表
                {isAdminUser && <span className="ml-2 text-red-500">(管理员)</span>}
              </span>
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '发布中...' : '发布评论'}
              </button>
            </div>
          </form>
        )}

        {/* 评论列表 */}
        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              暂无评论，来发表第一条评论吧！
            </p>
          ) : (
            // 构建id到评论的映射，传递给递归渲染
            (() => {
              const commentById: Record<number, Comment> = {};
              const buildMap = (arr: Comment[]) => {
                arr.forEach(c => {
                  commentById[c.id] = c;
                  if (c.replies) buildMap(c.replies);
                });
              };
              buildMap(comments);
              return comments.map(c => renderCommentRecursive(c, commentById));
            })()
          )}
        </div>
      </div>
    </div>
  );
} 