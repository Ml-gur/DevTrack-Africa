import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bookmark, 
  Search, 
  Filter,
  X,
  CheckCircle2,
  TrendingUp,
  HelpCircle,
  Calendar,
  Tag,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { Post } from '../types/social';
import PostCard from './PostCard';

interface BookmarkedPostsProps {
  currentUser: any;
  onViewDetails?: (post: Post) => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export default function BookmarkedPosts({
  currentUser,
  onViewDetails,
  onLike,
  onComment
}: BookmarkedPostsProps) {
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'progress_update' | 'task_completed' | 'help_request'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookmarks, searchQuery, filterType, sortBy]);

  const loadBookmarks = () => {
    // In production, load from localStorage
    const savedBookmarks = localStorage.getItem('bookmarked_posts');
    if (savedBookmarks) {
      try {
        const parsed = JSON.parse(savedBookmarks);
        setBookmarks(parsed);
      } catch (error) {
        console.error('Error loading bookmarks:', error);
        setBookmarks([]);
      }
    } else {
      // Demo bookmarks
      setBookmarks([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookmarks];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        post.author.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(post => post.postType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

    setFilteredBookmarks(filtered);
  };

  const handleRemoveBookmark = (postId: string) => {
    const updatedBookmarks = bookmarks.filter(post => post.id !== postId);
    setBookmarks(updatedBookmarks);
    localStorage.setItem('bookmarked_posts', JSON.stringify(updatedBookmarks));
    console.log('🗑️ Removed bookmark:', postId);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to remove all bookmarks?')) {
      setBookmarks([]);
      localStorage.removeItem('bookmarked_posts');
      console.log('🗑️ Cleared all bookmarks');
    }
  };

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

  const postTypeStats = {
    all: bookmarks.length,
    progress_update: bookmarks.filter(p => p.postType === 'progress_update').length,
    task_completed: bookmarks.filter(p => p.postType === 'task_completed').length,
    help_request: bookmarks.filter(p => p.postType === 'help_request').length
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bookmark className="w-8 h-8" />
            Bookmarked Posts
          </h1>
          <p className="text-muted-foreground">
            Your saved posts for future reference
          </p>
        </div>

        {bookmarks.length > 0 && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={filterType === 'all' ? 'ring-2 ring-primary' : 'cursor-pointer'} onClick={() => setFilterType('all')}>
          <CardContent className="p-4 text-center">
            <Bookmark className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{postTypeStats.all}</div>
            <div className="text-sm text-muted-foreground">All Posts</div>
          </CardContent>
        </Card>

        <Card className={filterType === 'progress_update' ? 'ring-2 ring-blue-500' : 'cursor-pointer'} onClick={() => setFilterType('progress_update')}>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{postTypeStats.progress_update}</div>
            <div className="text-sm text-muted-foreground">Progress</div>
          </CardContent>
        </Card>

        <Card className={filterType === 'task_completed' ? 'ring-2 ring-green-500' : 'cursor-pointer'} onClick={() => setFilterType('task_completed')}>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{postTypeStats.task_completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>

        <Card className={filterType === 'help_request' ? 'ring-2 ring-orange-500' : 'cursor-pointer'} onClick={() => setFilterType('help_request')}>
          <CardContent className="p-4 text-center">
            <HelpCircle className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{postTypeStats.help_request}</div>
            <div className="text-sm text-muted-foreground">Help Requests</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bookmarked posts..."
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={sortBy === 'oldest' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('oldest')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Oldest
              </Button>
            </div>
          </div>

          {/* Active Filters */}
          {(filterType !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              
              {filterType !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getPostTypeIcon(filterType)}
                  <span className="capitalize">{filterType.replace('_', ' ')}</span>
                  <button onClick={() => setFilterType('all')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}

              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookmarked Posts */}
      {filteredBookmarks.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold mb-2">No bookmarks found</h3>
            {bookmarks.length === 0 ? (
              <p className="text-muted-foreground">
                Start bookmarking posts from the community feed to save them for later!
              </p>
            ) : (
              <p className="text-muted-foreground">
                No posts match your current filters. Try adjusting your search or filters.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredBookmarks.length} of {bookmarks.length} bookmarked post{bookmarks.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filteredBookmarks.map((post) => (
            <div key={post.id} className="relative">
              <PostCard
                post={post}
                currentUserId={currentUser?.id || ''}
                onLike={onLike || (() => {})}
                onComment={onComment || (() => {})}
                onViewDetails={onViewDetails}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveBookmark(post.id)}
                className="absolute top-4 right-4 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
              >
                <Bookmark className="w-4 h-4 fill-current" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
