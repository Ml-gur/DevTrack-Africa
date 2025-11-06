/**
 * Minimal Project Card - Beautiful project card with smooth animations
 */

import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import {
  MoreHorizontal,
  Calendar,
  Target,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Share2,
  Archive
} from 'lucide-react';
import { Project } from '../types/database';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';

interface MinimalProjectCardProps {
  project: Project;
  taskCount: number;
  completedTaskCount: number;
  isFavorite?: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onShare?: () => void;
}

export default function MinimalProjectCard({
  project,
  taskCount,
  completedTaskCount,
  isFavorite = false,
  onOpen,
  onEdit,
  onDelete,
  onToggleFavorite,
  onShare
}: MinimalProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const progressPercentage = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-l-red-500';
      case 'medium':
        return 'bg-yellow-50 border-l-yellow-500';
      default:
        return 'bg-gray-50 border-l-gray-300';
    }
  };

  return (
    <Card
      className={`border-l-4 ${getPriorityColor(project.priority)} hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden relative`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
    >
      {/* Favorite Badge */}
      {isFavorite && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Cover Image */}
      {project.images && project.images.length > 0 && project.images[0] && (
        <div className="relative w-full h-48 overflow-hidden">
          <img 
            src={project.images[0]} 
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Hide image if failed to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Project Icon & Title */}
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                {project.title?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-500">
                  Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onOpen(); }}>
                <Eye className="w-4 h-4 mr-2" />
                Open Project
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onToggleFavorite && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}>
                  <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </DropdownMenuItem>
              )}
              {onShare && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onShare(); }}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {project.description || 'No description provided'}
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 font-medium">Progress</span>
            <span className="text-gray-900 font-bold">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Target className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-gray-900">{taskCount}</div>
            <div className="text-xs text-gray-500">Tasks</div>
          </div>
          
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <TrendingUp className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-green-600">{completedTaskCount}</div>
            <div className="text-xs text-green-600">Done</div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Clock className="w-3 h-3" />
            </div>
            <div className="text-lg font-bold text-purple-600">{taskCount - completedTaskCount}</div>
            <div className="text-xs text-purple-600">Active</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status?.replace('_', ' ')}
            </Badge>
            {project.is_public && (
              <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                Public
              </Badge>
            )}
          </div>

          {project.due_date && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              {format(new Date(project.due_date), 'MMM d')}
            </div>
          )}
        </div>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{project.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </CardContent>
    </Card>
  );
}
