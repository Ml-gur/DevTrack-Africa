/**
 * Keyboard Shortcuts Manager - Power User Features
 * Provides system-wide keyboard shortcuts for rapid navigation
 */

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  Command,
  Search,
  Plus,
  Home,
  FolderOpen,
  BarChart3,
  Settings,
  LogOut,
  Keyboard,
  Zap
} from 'lucide-react';

interface Shortcut {
  key: string;
  description: string;
  category: 'navigation' | 'actions' | 'general';
  icon?: React.ReactNode;
}

interface KeyboardShortcutsManagerProps {
  onNavigate?: (page: string) => void;
  onAction?: (action: string) => void;
  onCreateProject?: () => void;
  onOpenSearch?: () => void;
  onToggleSettings?: () => void;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { key: 'g h', description: 'Go to Homepage', category: 'navigation', icon: <Home className="w-4 h-4" /> },
  { key: 'g p', description: 'Go to Projects', category: 'navigation', icon: <FolderOpen className="w-4 h-4" /> },
  { key: 'g a', description: 'Go to Analytics', category: 'navigation', icon: <BarChart3 className="w-4 h-4" /> },
  { key: 'g s', description: 'Go to Settings', category: 'navigation', icon: <Settings className="w-4 h-4" /> },
  
  // Actions
  { key: 'c', description: 'Create New Project', category: 'actions', icon: <Plus className="w-4 h-4" /> },
  { key: '/', description: 'Open Search', category: 'actions', icon: <Search className="w-4 h-4" /> },
  { key: 'ctrl+k', description: 'Command Palette', category: 'actions', icon: <Command className="w-4 h-4" /> },
  
  // General
  { key: '?', description: 'Show Keyboard Shortcuts', category: 'general', icon: <Keyboard className="w-4 h-4" /> },
  { key: 'esc', description: 'Close Modal/Dialog', category: 'general' },
];

export default function KeyboardShortcutsManager({
  onNavigate,
  onAction,
  onCreateProject,
  onOpenSearch,
  onToggleSettings
}: KeyboardShortcutsManagerProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [lastKeyTime, setLastKeyTime] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't trigger shortcuts when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Exception: allow '/' to open search
        if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          onOpenSearch?.();
        }
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTime;

      // Reset sequence if more than 1 second has passed
      if (timeSinceLastKey > 1000) {
        setPressedKeys([]);
      }

      // Build key combination string
      let keyCombo = '';
      if (e.ctrlKey || e.metaKey) keyCombo += 'ctrl+';
      if (e.shiftKey) keyCombo += 'shift+';
      if (e.altKey) keyCombo += 'alt+';
      keyCombo += e.key.toLowerCase();

      const newPressedKeys = [...pressedKeys, e.key.toLowerCase()];
      setPressedKeys(newPressedKeys);
      setLastKeyTime(now);

      // Clear pressed keys after a delay
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setPressedKeys([]);
      }, 1000);

      // Handle shortcuts
      const sequence = newPressedKeys.join(' ');

      // Show help
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onAction?.('command-palette');
        return;
      }

      // Search
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        onOpenSearch?.();
        return;
      }

      // Create project
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey && pressedKeys.length === 0) {
        e.preventDefault();
        onCreateProject?.();
        return;
      }

      // Navigation shortcuts with 'g' prefix
      if (sequence === 'g h') {
        e.preventDefault();
        onNavigate?.('home');
        setPressedKeys([]);
      } else if (sequence === 'g p') {
        e.preventDefault();
        onNavigate?.('projects');
        setPressedKeys([]);
      } else if (sequence === 'g a') {
        e.preventDefault();
        onNavigate?.('analytics');
        setPressedKeys([]);
      } else if (sequence === 'g s') {
        e.preventDefault();
        onToggleSettings?.();
        setPressedKeys([]);
      }

      // Close dialogs with ESC
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeoutId);
    };
  }, [pressedKeys, lastKeyTime, onNavigate, onAction, onCreateProject, onOpenSearch, onToggleSettings]);

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <>
      {/* Keyboard shortcuts indicator */}
      {pressedKeys.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono">{pressedKeys.join(' ')}</span>
        </div>
      )}

      {/* Help dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Speed up your workflow with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="font-semibold text-sm uppercase text-gray-500 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <Card key={index} className="border-none shadow-none">
                      <CardContent className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {shortcut.icon && (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              {shortcut.icon}
                            </div>
                          )}
                          <span className="text-sm text-gray-700">
                            {shortcut.description}
                          </span>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs">
                          {shortcut.key.split('+').map((part, i) => (
                            <span key={i}>
                              {i > 0 && <span className="mx-1">+</span>}
                              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300">
                                {part}
                              </kbd>
                            </span>
                          ))}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Pro Tip:</strong> Press <kbd className="px-2 py-1 bg-white rounded border border-blue-200 font-mono text-xs">?</kbd> anytime to show this help panel.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Hook for using keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      
      // Don't trigger when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Build key combination
      let keyCombo = '';
      if (e.ctrlKey || e.metaKey) keyCombo += 'ctrl+';
      if (e.shiftKey) keyCombo += 'shift+';
      if (e.altKey) keyCombo += 'alt+';
      keyCombo += e.key.toLowerCase();

      // Execute matching shortcut
      if (shortcuts[keyCombo]) {
        e.preventDefault();
        shortcuts[keyCombo]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
