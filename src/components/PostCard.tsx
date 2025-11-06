import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye, 
  Clock, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  MoreHorizontal,
  Flag,
  ExternalLink,
  User,
  Bookmark,
  Expand
} from 'lucide-react';
import { Post } from '../types/social';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  currentUserId: string;
  onComment?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  onView?: (postId: string) => void;
  onTagClick?: (tag: string) => void;
  onViewDetails?: (post: Post) => void;
  onBookmark?: (postId: string) => void;
  showComments?: boolean;
}

export default function PostCard({ 
  post, 
  onLike, 
  currentUserId, 
  onComment, 
  onViewProfile,
  onView,
  onTagClick,
  onViewDetails,
  onBookmark,
  showComments = false 
}: PostCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullReflection, setShowFullReflection] = useState(false);
  const [hasViewed, setHasViewed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getPostTypeIcon = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return <TrendingUp className="w-4 h-4" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'help_request':
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'task_completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'help_request':
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getPostTypeLabel = (type: Post['postType']) => {
    switch (type) {
      case 'progress_update':
        return 'Progress Update';
      case 'task_completed':
        return 'Task Completed';
      case 'help_request':
        return 'Help Request';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const isOwner = post.authorId === currentUserId;

  // Track view when component becomes visible
  useEffect(() => {
    if (onView && !hasViewed) {
      onView(post.id);
      setHasViewed(true);
    }
  }, [post.id, onView, hasViewed]);

  const handleProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(post.authorId);
    }
  };

  const handleHelpRequest = () => {
    if (onComment) {
      onComment(post.id);
    } else {
      // Use console.log instead of alert for iframe compatibility
      console.log(`💬 Help offer for ${post.author.fullName}'s ${post.project?.name} project - would open comment dialog`);
    }
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(post.id);
    }
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails && onViewDetails(post)}>
      <CardContent className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {/* Post Type Badge */}
            <Badge variant="secondary" className={`${getPostTypeColor(post.postType)} shrink-0`}>
              {getPostTypeIcon(post.postType)}
              <span className="ml-1">{getPostTypeLabel(post.postType)}</span>
            </Badge>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={handleBookmark}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current text-yellow-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
            onClick={handleProfileClick}
          >
            <AvatarImage src={post.author?.profilePicture} />
            <AvatarFallback>{getInitials(post.author?.fullName || 'U')}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span 
                className="font-semibold cursor-pointer hover:text-primary transition-colors"
                onClick={handleProfileClick}
              >
                {post.author?.fullName}
              </span>
              {post.author?.title && (
                <Badge variant="outline" className="text-xs">
                  {post.author.title}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{post.project?.name}</span>
              {post.project?.techStack && post.project.techStack.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {post.project.techStack.slice(0, 2).map((tech, index) => (
                      <Badge key={`${post.id}-tech-${index}-${tech}`} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {post.project.techStack.length > 2 && (
                      <span className="text-xs">+{post.project.techStack.length - 2}</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Quick Profile Action */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleProfileClick}
            className="h-8 px-2 text-muted-foreground hover:text-primary"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="space-y-4">
          {/* Main Content */}
          <div>
            <p className="text-base leading-relaxed">{post.content}</p>
          </div>

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-3">
              {post.attachments.map((attachment, index) => (
                <div key={`${post.id}-attachment-${attachment.id || index}`}>
                  {attachment.fileType === 'image' ? (
                    <div className="relative">
                      <ImageWithFallback
                        src={attachment.fileUrl}
                        alt={attachment.fileName}
                        className="w-full max-w-md rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        style={{ maxHeight: '400px', objectFit: 'cover' }}
                        onClick={() => setIsExpanded(!isExpanded)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ExternalLink className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.fileSize / 1024).toFixed(1)} KB • {attachment.fileType}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reflection Notes */}
          {post.reflectionNotes && (
            <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary">Reflection</span>
                <Badge variant="outline" className="text-xs">
                  Learning Notes
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {showFullReflection 
                  ? post.reflectionNotes 
                  : truncateText(post.reflectionNotes, 150)
                }
                {post.reflectionNotes.length > 150 && (
                  <button
                    onClick={() => setShowFullReflection(!showFullReflection)}
                    className="ml-2 text-primary hover:underline text-xs font-medium"
                  >
                    {showFullReflection ? 'Show less' : 'Read more'}
                  </button>
                )}
              </p>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag, index) => (
                <Badge 
                  key={`${post.id}-tag-${index}-${tag}`} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-primary/10 transition-colors hover:scale-105"
                  onClick={() => onTagClick && onTagClick(tag)}
                  title={`Filter by #${tag}`}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Post Stats and Actions */}
        <div className="flex items-center justify-between">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.viewCount}</span>
            </div>
            
            {post.likeCount > 0 && (
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{post.likeCount}</span>
              </div>
            )}
            
            {post.commentCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{post.commentCount}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className={`h-9 px-3 ${
                post.isLikedByCurrentUser 
                  ? 'text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
              {post.isLikedByCurrentUser ? 'Liked' : 'Like'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onComment && onComment(post.id);
              }}
              className="h-9 px-3 hover:bg-blue-50 hover:text-blue-600"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </Button>

            {/* View Details Button */}
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(post);
                }}
                className="h-9 px-3 hover:bg-primary/10 hover:text-primary"
              >
                <Expand className="w-4 h-4 mr-1" />
                View Details
              </Button>
            )}

            {/* Help Request specific action */}
            {post.postType === 'help_request' && !isOwner && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleHelpRequest();
                }}
                className="h-9 px-3 ml-2 border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Offer Help
              </Button>
            )}
          </div>
        </div>

        {/* Achievement Badge for Task Completion */}
        {post.postType === 'task_completed' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Task Completed! 🎉</p>
                  <p className="text-xs text-green-600">Another step forward in your development journey</p>
                </div>
              </div>
              {!isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(post.id)}
                  className="text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                  👏 Congrats
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Help Request Call-to-Action */}
        {post.postType === 'help_request' && (
          <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">Community Help Needed 🤝</p>
                <p className="text-xs text-orange-600">Share your knowledge and help a fellow developer</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}