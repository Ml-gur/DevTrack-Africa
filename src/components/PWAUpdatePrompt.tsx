import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useServiceWorker } from './hooks/usePWA';

export default function PWAUpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-2xl border-2 border-blue-500/20 max-w-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <h4 className="font-bold mb-1">New Version Available!</h4>
              <p className="text-sm text-muted-foreground">
                We've made DevTrack Africa even better. Update now to get the latest features and improvements.
              </p>
            </div>
            <Button
              onClick={updateServiceWorker}
              className="w-full"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Update Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
