import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  MessageCircle, 
  Heart, 
  Reply,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  ThumbsUp,
  Smile,
  Send,
  ArrowUpCircle,
  Clock
} from 'lucide-react';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: {
    id: string;
    fullName: string;
    profilePicture?: string;
    title?: string;
  };
  content: string;
  parentCommentId?: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
  currentUser: any;
  onClose?: () => void;
  compact?: boolean;
}

export default function PostComments({ 
  postId, 
  currentUserId, 
  currentUser,
  onClose,
  compact = false
}: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>('recent');

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = () => {
    // In production, this would fetch from localStorage/API
    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        postId: postId,
        authorId: 'user-demo-1',
        author: {
          id: 'user-demo-1',
          fullName: 'Sarah Johnson',
          profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
          title: 'Senior Developer'
        },
        content: 'This is amazing work! I faced a similar challenge last month. Have you considered using Redis for caching? It really helped improve my API response times.',
        likeCount: 5,
        isLikedByCurrentUser: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        replies: [
          {
            id: 'comment-1-reply-1',
            postId: postId,
            authorId: currentUserId,
            author: {
              id: currentUserId,
              fullName: currentUser?.fullName || 'You',
              profilePicture: currentUser?.profilePicture,
              title: currentUser?.title || 'Developer'
            },
            content: 'Thanks for the suggestion! I\'ll definitely look into Redis. Do you have any resources you\'d recommend?',
            parentCommentId: 'comment-1',
            likeCount: 2,
            isLikedByCurrentUser: false,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            updatedAt: new Date(Date.now() - 1800000).toISOString()
          }
        ]
      },
      {
        id: 'comment-2',
        postId: postId,
        authorId: 'user-demo-2',
        author: {
          id: 'user-demo-2',
          fullName: 'Michael Chen',
          profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          title: 'Full Stack Engineer'
        },
        content: 'Congratulations! 🎉 The architecture looks really solid. Would love to see a follow-up post about how you handle error boundaries and fallback UIs.',
        likeCount: 3,
        isLikedByCurrentUser: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    setComments(mockComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const comment: Comment = {
        id: `comment-${Date.now()}`,
        postId: postId,
        authorId: currentUserId,
        author: {
          id: currentUserId,
          fullName: currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Developer',
          profilePicture: currentUser?.profilePicture,
          title: currentUser?.title || 'Developer'
        },
        content: newComment,
        likeCount: 0,
        isLikedByCurrentUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      console.log('✅ Comment submitted:', comment);
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);

    try {
      const reply: Comment = {
        id: `comment-${Date.now()}`,
        postId: postId,
        authorId: currentUserId,
        author: {
          id: currentUserId,
          fullName: currentUser?.fullName || currentUser?.email?.split('@')[0] || 'Developer',
          profilePicture: currentUser?.profilePicture,
          title: currentUser?.title || 'Developer'
        },
        content: replyContent,
        parentCommentId: parentId,
        likeCount: 0,
        isLikedByCurrentUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), reply]
          };
        }
        return comment;
      }));

      setReplyContent('');
      setReplyingTo(null);
      console.log('✅ Reply submitted:', reply);
    } catch (error) {
      console.error('❌ Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies?.map(reply => 
              reply.id === commentId
                ? {
                    ...reply,
                    likeCount: reply.isLikedByCurrentUser ? reply.likeCount - 1 : reply.likeCount + 1,
                    isLikedByCurrentUser: !reply.isLikedByCurrentUser
                  }
                : reply
            )
          };
        }
        return comment;
      }));
    } else {
      setComments(prev => prev.map(comment => 
        comment.id === commentId
          ? {
              ...comment,
              likeCount: comment.isLikedByCurrentUser ? comment.likeCount - 1 : comment.likeCount + 1,
              isLikedByCurrentUser: !comment.isLikedByCurrentUser
            }
          : comment
      ));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likeCount + (b.replies?.length || 0)) - (a.likeCount + (a.replies?.length || 0));
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const CommentItem = ({ comment, isReply = false, parentId }: { comment: Comment; isReply?: boolean; parentId?: string }) => {
    const isOwner = comment.authorId === currentUserId;

    return (
      <div className={`space-y-3 ${isReply ? 'ml-12 mt-3' : ''}`}>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={comment.author.profilePicture} />
            <AvatarFallback>{getInitials(comment.author.fullName)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            {/* Comment Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.author.fullName}</span>
                {comment.author.title && (
                  <Badge variant="outline" className="text-xs">
                    {comment.author.title}
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(comment.createdAt)}
                </span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </div>

            {/* Comment Content */}
            <p className="text-sm leading-relaxed">{comment.content}</p>

            {/* Comment Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeComment(comment.id, isReply, parentId)}
                className={`h-7 px-2 text-xs ${
                  comment.isLikedByCurrentUser 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`w-3 h-3 mr-1 ${comment.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
              </Button>

              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}

              {isOwner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Reply Form */}
            {replyingTo === comment.id && !isReply && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder={`Reply to ${comment.author.fullName}...`}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={!replyContent.trim() || isSubmitting}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="space-y-3 mt-4">
                {comment.replies.map((reply) => (
                  <CommentItem 
                    key={reply.id} 
                    comment={reply} 
                    isReply={true}
                    parentId={comment.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={compact ? 'space-y-4' : ''}>
      {!compact && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'recent' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                Recent
              </Button>
              <Button
                variant={sortBy === 'popular' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('popular')}
              >
                Popular
              </Button>
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className={compact ? 'p-0' : ''}>
        <div className="space-y-6">
          {/* New Comment Form */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={currentUser?.profilePicture} />
                <AvatarFallback>
                  {getInitials(currentUser?.fullName || currentUser?.email?.split('@')[0] || 'You')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts, ask questions, or offer help..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      <Smile className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Comments List */}
          {sortedComments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
