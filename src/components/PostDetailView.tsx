import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Eye,
  Bookmark,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Clock,
  Users,
  BarChart3,
  X,
  ExternalLink,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Download
} from 'lucide-react';
import { Post } from '../types/social';
import { ImageWithFallback } from './figma/ImageWithFallback';
import PostComments from './PostComments';
import { toast } from 'sonner';

interface PostDetailViewProps {
  post: Post;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onLike: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export default function PostDetailView({
  post,
  currentUser,
  isOpen,
  onClose,
  onLike,
  onBookmark
}: PostDetailViewProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

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

  const handleShare = (platform: string) => {
    const postUrl = `${window.location.origin}/posts/${post.id}`;
    const text = `Check out this post: ${post.content.slice(0, 100)}...`;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl);
        toast.success('Link copied to clipboard!');
        setShowShareMenu(false);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowShareMenu(false);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (onBookmark) {
      onBookmark(post.id);
    }
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const engagementRate = post.viewCount > 0 
    ? Math.round(((post.likeCount + post.commentCount) / post.viewCount) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogDescription className="sr-only">
          View detailed information about this post, including content, images, comments, and engagement metrics.
        </DialogDescription>
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className={getPostTypeColor(post.postType)}>
                  {getPostTypeIcon(post.postType)}
                  <span className="ml-1">{getPostTypeLabel(post.postType)}</span>
                </Badge>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(post.createdAt)}</span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Author Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.author?.profilePicture} />
                    <AvatarFallback>{getInitials(post.author?.fullName || 'U')}</AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.author?.fullName}</span>
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
                            {post.project.techStack.slice(0, 3).map((tech, index) => (
                              <Badge key={`detail-tech-${index}-${tech}`} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    className={isBookmarked ? 'text-yellow-600' : ''}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    
                    {showShareMenu && (
                      <Card className="absolute right-0 top-full mt-1 w-48 z-50 shadow-lg">
                        <CardContent className="p-2">
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleShare('twitter')}
                            >
                              <Twitter className="w-4 h-4 mr-2" />
                              Share on Twitter
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleShare('facebook')}
                            >
                              <Facebook className="w-4 h-4 mr-2" />
                              Share on Facebook
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleShare('linkedin')}
                            >
                              <Linkedin className="w-4 h-4 mr-2" />
                              Share on LinkedIn
                            </Button>
                            <Separator />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => handleShare('copy')}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div className="space-y-4">
                <p className="text-base leading-relaxed">{post.content}</p>

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="space-y-3">
                    {post.attachments.map((attachment, index) => (
                      <div key={`detail-attachment-${attachment.id || index}`}>
                        {attachment.fileType === 'image' ? (
                          <ImageWithFallback
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full rounded-lg border shadow-sm"
                            style={{ maxHeight: '500px', objectFit: 'contain' }}
                          />
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
                              <Download className="w-4 h-4" />
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
                      {post.reflectionNotes}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.tags.map((tag, index) => (
                      <Badge 
                        key={`detail-tag-${index}-${tag}`} 
                        variant="secondary" 
                        className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="font-semibold">{post.viewCount}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <div className="font-semibold">{post.likeCount}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="font-semibold">{post.commentCount}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs for Comments and Insights */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comments">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Comments ({post.commentCount})
                  </TabsTrigger>
                  <TabsTrigger value="insights">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="comments" className="mt-6">
                  <PostComments
                    postId={post.id}
                    currentUserId={currentUser?.id || ''}
                    currentUser={currentUser}
                    compact={true}
                  />
                </TabsContent>

                <TabsContent value="insights" className="mt-6 space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Post Performance
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Engagement Rate</span>
                            <span className="text-sm font-semibold">{engagementRate}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{ width: `${Math.min(engagementRate, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Like to View Ratio</span>
                            <span className="text-sm font-semibold">
                              {post.viewCount > 0 ? Math.round((post.likeCount / post.viewCount) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-red-500 rounded-full h-2 transition-all"
                              style={{ 
                                width: `${post.viewCount > 0 ? Math.min((post.likeCount / post.viewCount) * 100, 100) : 0}%` 
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">Comment to View Ratio</span>
                            <span className="text-sm font-semibold">
                              {post.viewCount > 0 ? Math.round((post.commentCount / post.viewCount) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-green-500 rounded-full h-2 transition-all"
                              style={{ 
                                width: `${post.viewCount > 0 ? Math.min((post.commentCount / post.viewCount) * 100, 100) : 0}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Reach & Impact
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-blue-800">Total Views</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-900">{post.viewCount}</div>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-purple-800">Estimated Reach</span>
                          </div>
                          <div className="text-2xl font-bold text-purple-900">
                            {Math.round(post.viewCount * 1.5)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t px-6 py-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(post.id)}
                  className={`h-9 ${
                    post.isLikedByCurrentUser 
                      ? 'text-red-500 hover:text-red-600 bg-red-50' 
                      : 'hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${post.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                  {post.isLikedByCurrentUser ? 'Liked' : 'Like'}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab('comments')}
                  className="h-9 hover:bg-blue-50 hover:text-blue-600"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Comment
                </Button>
              </div>

              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
