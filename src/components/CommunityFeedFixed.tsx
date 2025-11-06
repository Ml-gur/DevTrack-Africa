import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { 
  Plus, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  Code2,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Calendar,
  Star,
  Award,
  Zap,
  X
} from 'lucide-react';
import { Post, FeedFilter, TrendingProject } from '../types/social';
import { getAllPosts, createPost } from '../utils/database-service';
import CreatePostModal from './CreatePostModal';
import PostCard from './PostCard';
import ProjectShowcase from './ProjectShowcase';
import CommunityFiltering from './CommunityFiltering';
import ShareProjectModal from './ShareProjectModal';

interface CommunityFeedProps {
  currentUser: any;
  onBack?: () => void;
  onProjectClick?: (project: any) => void;
  onProfileClick?: (userId: string) => void;
}

// Mock data for community stats and achievements
const communityStats = {
  totalMembers: 1247,
  activeToday: 89,
  projectsShared: 523,
  helpRequestsAnswered: 234
};

const weeklyHighlights = [
  {
    id: '1',
    type: 'achievement',
    title: 'First 1000 Members! 🎉',
    description: 'DevTrack Africa community has reached 1,000 registered developers!',
    icon: Users,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: '2',
    type: 'featured',
    title: 'Project of the Week',
    description: 'African AgriTech Platform by Kwame Asante',
    icon: Award,
    color: 'bg-yellow-100 text-yellow-800'
  },
  {
    id: '3',
    type: 'milestone',
    title: '100 Projects Completed',
    description: 'Community members have completed 100 projects this month!',
    icon: Zap,
    color: 'bg-blue-100 text-blue-800'
  }
];

const trendingTopics = [
  { tag: 'react', count: 45, trend: '+15%' },
  { tag: 'mobile-development', count: 32, trend: '+8%' },
  { tag: 'ai-ml', count: 28, trend: '+12%' },
  { tag: 'web3', count: 21, trend: '+25%' },
  { tag: 'fintech', count: 19, trend: '+5%' }
];

export default function CommunityFeed({ 
  currentUser, 
  onBack, 
  onProjectClick,
  onProfileClick 
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareProject, setShowShareProject] = useState(false);
  const [filter, setFilter] = useState<FeedFilter>({ postType: 'all', timeframe: 'week', sortBy: 'recent' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (currentUser?.id) {
      loadPosts();
    }
  }, [currentUser?.id]); // Remove filter dependency to avoid re-loading

  // Add a refresh function that can be called to reload posts
  const refreshPosts = useCallback(async () => {
    if (currentUser?.id) {
      console.log('🔄 Refreshing community posts...');
      await loadPosts();
    }
  }, [currentUser?.id]);

  // Auto-refresh posts every 30 seconds to see new posts from other users
  useEffect(() => {
    if (!currentUser?.id) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing community posts for cross-user updates');
      refreshPosts();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id, refreshPosts]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await getAllPosts();
        
        if (result.error) {
          console.log('Database not available, using mock posts');
          setPosts(createMockPosts());
          if (result.error.code === 'DB_NOT_AVAILABLE' || 
              result.error.code === 'PGRST205' || 
              result.error.message?.includes('could not find')) {
            setError('Community features are not available yet. Please set up the database to enable posts.');
          }
        } else {
          const appPosts = (result.data || []).map((dbPost: any) => convertDbPostToAppPost(dbPost));
          const postsToUse = appPosts.length > 0 ? appPosts : createMockPosts();
          setAllPosts(postsToUse);
          setPosts(postsToUse);
          console.log(`✅ Loaded ${appPosts.length} database posts, ${postsToUse.length} total posts displayed`);
        }
      } catch (error) {
        console.log('Error loading posts, using mock data:', error);
        const mockPosts = createMockPosts();
        setAllPosts(mockPosts);
        setPosts(mockPosts);
        setError('Using demo data - database connection not available');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      const mockPosts = createMockPosts();
      setAllPosts(mockPosts);
      setPosts(mockPosts);
      setError('Using demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const createMockPosts = (): Post[] => [
    {
      id: '1',
      projectId: 'proj1',
      authorId: 'user1',
      taskId: 'task1',
      content: 'Just deployed my first React Native app to the App Store! 🚀 Building for African markets with offline-first architecture was challenging but so rewarding.',
      reflectionNotes: 'Learned so much about app optimization and user experience for areas with limited connectivity. The push notification system was particularly tricky.',
      postType: 'task_completed',
      attachments: [
        {
          id: 'att1',
          postId: '1',
          fileUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
          fileType: 'image',
          fileName: 'app-store-screenshot.png',
          fileSize: 245760,
          uploadedAt: '2024-01-07T14:00:00Z'
        }
      ],
      tags: ['react-native', 'mobile', 'app-store', 'offline-first'],
      viewCount: 156,
      likeCount: 23,
      commentCount: 8,
      createdAt: '2024-01-07T14:00:00Z',
      updatedAt: '2024-01-07T14:00:00Z',
      author: {
        id: 'user1',
        fullName: 'Amara Okafor',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        title: 'Mobile Developer'
      },
      project: {
        id: 'proj1',
        name: 'AgriConnect Mobile',
        techStack: ['React Native', 'Node.js', 'MongoDB']
      },
      isLikedByCurrentUser: false
    },
    {
      id: '2',
      projectId: 'proj2',
      authorId: 'user2',
      content: 'Need help with WebRTC implementation for my video calling feature. The peer connection keeps dropping in low bandwidth scenarios.',
      reflectionNotes: 'Trying to build a reliable video calling solution for rural areas. Network conditions are very challenging but this is exactly the problem we need to solve.',
      postType: 'help_request',
      attachments: [],
      tags: ['webrtc', 'video-calling', 'networking', 'help-needed'],
      viewCount: 89,
      likeCount: 12,
      commentCount: 15,
      createdAt: '2024-01-07T12:30:00Z',
      updatedAt: '2024-01-07T12:30:00Z',
      author: {
        id: 'user2',
        fullName: 'Kwame Asante',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        title: 'Full Stack Developer'
      },
      project: {
        id: 'proj2',
        name: 'Rural Telemedicine Platform',
        techStack: ['React', 'WebRTC', 'Socket.io']
      },
      isLikedByCurrentUser: true
    },
    {
      id: '3',
      projectId: 'proj3',
      authorId: 'user3',
      content: 'Exciting progress on the blockchain voting system! Smart contracts are now deployed on testnet and initial security audits look good.',
      reflectionNotes: 'Building transparent voting infrastructure for local governments. The cryptographic challenges were intense but the potential impact makes it worth every late night.',
      postType: 'progress_update',
      attachments: [
        {
          id: 'att2',
          postId: '3',
          fileUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop',
          fileType: 'image',
          fileName: 'blockchain-dashboard.png',
          fileSize: 180240,
          uploadedAt: '2024-01-07T10:15:00Z'
        }
      ],
      tags: ['blockchain', 'ethereum', 'voting', 'security'],
      viewCount: 234,
      likeCount: 45,
      commentCount: 12,
      createdAt: '2024-01-07T10:15:00Z',
      updatedAt: '2024-01-07T10:15:00Z',
      author: {
        id: 'user3',
        fullName: 'Fatima Adebayo',
        profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        title: 'Blockchain Developer'
      },
      project: {
        id: 'proj3',
        name: 'DecentralVote',
        techStack: ['Solidity', 'Web3.js', 'React', 'IPFS']
      },
      isLikedByCurrentUser: false
    }
  ];

  const convertDbPostToAppPost = (dbPost: any): Post => ({
    id: dbPost.id,
    projectId: dbPost.project_id,
    authorId: dbPost.author_id,
    content: dbPost.content,
    postType: dbPost.post_type,
    attachments: dbPost.attachments || [],
    tags: dbPost.tags || [],
    viewCount: 0,
    likeCount: 0,
    commentCount: 0,
    createdAt: dbPost.created_at,
    updatedAt: dbPost.created_at,
    author: {
      id: dbPost.author?.id || dbPost.author_id,
      fullName: dbPost.author?.full_name || 'Unknown User',
      profilePicture: dbPost.author?.profile_image_url,
      title: dbPost.author?.title || 'Developer'
    },
    project: {
      id: dbPost.project?.id || dbPost.project_id,
      name: dbPost.project?.title || 'Untitled Project',
      techStack: []
    },
    isLikedByCurrentUser: false
  });

  // Advanced filtering and search
  useEffect(() => {
    let filtered = [...allPosts];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.project?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filter.postType && filter.postType !== 'all') {
      filtered = filtered.filter(post => post.postType === filter.postType);
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(post => 
        filter.tags!.some(tag => post.tags.includes(tag))
      );
    }

    if (filter.techStack && filter.techStack.length > 0) {
      filtered = filtered.filter(post => 
        filter.techStack!.some(tech => 
          post.project?.techStack.some(projectTech => 
            projectTech.toLowerCase().includes(tech.toLowerCase())
          )
        )
      );
    }

    // Apply time filter
    if (filter.timeframe && filter.timeframe !== 'all') {
      const now = new Date();
      const timeLimit = new Date();
      
      switch (filter.timeframe) {
        case 'today':
          timeLimit.setDate(now.getDate() - 1);
          break;
        case 'week':
          timeLimit.setDate(now.getDate() - 7);
          break;
        case 'month':
          timeLimit.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => new Date(post.createdAt) >= timeLimit);
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount));
        break;
      case 'trending':
        // Simple trending algorithm based on recent engagement
        filtered.sort((a, b) => {
          const aScore = a.likeCount * 2 + a.commentCount * 3 + a.viewCount * 0.1;
          const bScore = b.likeCount * 2 + b.commentCount * 3 + b.viewCount * 0.1;
          return bScore - aScore;
        });
        break;
      case 'most-liked':
        filtered.sort((a, b) => b.likeCount - a.likeCount);
        break;
      case 'most-commented':
        filtered.sort((a, b) => b.commentCount - a.commentCount);
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    setPosts(filtered);
  }, [allPosts, searchQuery, filter]);

  const handleComment = async (postId: string) => {
    // Increment view count when user engages
    setAllPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, viewCount: post.viewCount + 1 }
        : post
    ));
    
    // Open comment modal instead of using alert - this fixes the iframe issue
    const post = posts.find(p => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setShowCommentModal(true);
      setCommentText('');
    }
    console.log(`💬 Opening comments for post ${postId}`);
  };

  const handleSubmitComment = async () => {
    if (!selectedPost || !commentText.trim()) return;
    
    // In a real app, this would save to database
    console.log(`💬 Comment submitted on post ${selectedPost.id}: "${commentText}"`);
    
    // Update comment count
    setAllPosts(prev => prev.map(post => 
      post.id === selectedPost.id 
        ? { ...post, commentCount: post.commentCount + 1 }
        : post
    ));
    
    // Close modal and reset
    setShowCommentModal(false);
    setSelectedPost(null);
    setCommentText('');
    
    // Show success feedback without alert
    console.log('✅ Comment added successfully');
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
    setSelectedPost(null);
    setCommentText('');
  };

  const handleLike = async (postId: string) => {
    setAllPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likeCount: post.isLikedByCurrentUser ? post.likeCount - 1 : post.likeCount + 1,
            isLikedByCurrentUser: !post.isLikedByCurrentUser
          }
        : post
    ));
    
    // In a real app, you would also persist this to the database
    console.log(`💝 Post ${postId} ${posts.find(p => p.id === postId)?.isLikedByCurrentUser ? 'unliked' : 'liked'} by user ${currentUser?.id}`);
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      // Simple share implementation - in real app would have more options
      if (navigator.share) {
        navigator.share({
          title: `${post.author.fullName}'s Post - DevTrack Africa`,
          text: post.content,
          url: window.location.href + `#post-${postId}`
        });
      } else {
        // Fallback - copy to clipboard
        await navigator.clipboard.writeText(`Check out this post by ${post.author.fullName} on DevTrack Africa: "${post.content}"`);
        console.log('📋 Post link copied to clipboard!');
      }
    }
    console.log(`🔗 Sharing post ${postId}`);
  };

  const handleViewProfile = (userId: string) => {
    const user = posts.find(p => p.authorId === userId)?.author;
    if (user && onProfileClick) {
      onProfileClick(userId);
    }
    console.log(`👤 Viewing profile for ${user?.fullName} (${userId})`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">DevTrack Africa Community</h1>
          <p className="text-muted-foreground">
            Connect, learn, and build together with African developers
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={refreshPosts} variant="ghost" size="sm" className="shrink-0">
            <MessageCircle className="w-4 h-4 mr-2" />
            Refresh Feed
          </Button>
          <Button onClick={() => setShowCreatePost(true)} variant="outline" className="shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Quick Post
          </Button>
          <Button onClick={() => setShowShareProject(true)} className="shrink-0">
            <Share2 className="w-4 h-4 mr-2" />
            Share Project
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.totalMembers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Members</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.activeToday}</div>
            <div className="text-sm text-muted-foreground">Active Today</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Code2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.projectsShared}</div>
            <div className="text-sm text-muted-foreground">Projects Shared</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{communityStats.helpRequestsAnswered}</div>
            <div className="text-sm text-muted-foreground">Helps Provided</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Highlights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Weekly Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weeklyHighlights.map(highlight => (
              <div key={highlight.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className={`p-2 rounded-lg ${highlight.color}`}>
                  <highlight.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{highlight.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={() => handleLike(post.id)}
            onComment={() => handleComment(post.id)}
            onShare={() => handleShare(post.id)}
            onViewProfile={() => handleViewProfile(post.authorId)}
            onTagClick={(tag) => console.log(`Tag clicked: ${tag}`)}
          />
        ))}
      </div>

      {/* Comment Modal - This replaces the problematic alert() */}
      <Dialog open={showCommentModal} onOpenChange={setShowCommentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Add Comment
            </DialogTitle>
            <DialogDescription>
              Comment on "{selectedPost?.content.slice(0, 50)}..." by {selectedPost?.author.fullName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              className="min-h-[100px]"
            />
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCloseCommentModal}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
              >
                Submit Comment
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground">
              💡 Tip: In the full version, comments would be saved to the database and displayed to all users.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={(postData: any) => {
            console.log('Creating post:', postData);
            setShowCreatePost(false);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Share Project Modal */}
      {showShareProject && (
        <ShareProjectModal
          onClose={() => setShowShareProject(false)}
          onSubmit={(shareData: any) => {
            console.log('Sharing project:', shareData);
            setShowShareProject(false);
          }}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}