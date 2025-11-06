import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Check,
  Sparkles,
  Zap,
  Shield,
  Wifi
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Don't show install prompt in Figma preview
    if (window.location.hostname.includes('figma')) {
      return;
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay (better UX)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000); // Show after 3 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for user's response
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleNeverShowAgain = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'permanent');
  };

  // Don't show if installed or permanently dismissed
  if (isInstalled) return null;
  if (localStorage.getItem('pwa-install-dismissed') === 'permanent') return null;
  if (!showPrompt && !showIOSInstructions) return null;

  // iOS Installation Instructions
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 space-y-4 relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => setShowIOSInstructions(false)}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold">Install on iOS</h3>
            <p className="text-sm text-muted-foreground">
              Follow these steps to install DevTrack Africa on your iPhone or iPad
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Tap the <strong>Share</strong> button (square with arrow) at the bottom of Safari</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-300">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Scroll down and tap <strong>"Add to Home Screen"</strong></p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-600 dark:text-blue-300">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">Tap <strong>"Add"</strong> in the top right corner</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4 text-green-600 dark:text-green-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm">The app icon will appear on your home screen!</p>
              </div>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={() => setShowIOSInstructions(false)}
          >
            Got it!
          </Button>
        </Card>
      </div>
    );
  }

  // Regular Install Prompt
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in slide-in-from-bottom-5">
      <Card className="p-4 shadow-2xl border-2 border-primary/20">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              {isIOS ? (
                <Smartphone className="w-6 h-6 text-white" />
              ) : (
                <Monitor className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold mb-1">Install DevTrack Africa</h4>
              <p className="text-sm text-muted-foreground">
                Get the full app experience with offline access and faster loading
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wifi className="w-4 h-4 text-green-500" />
              <span>Works Offline</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>100% Secure</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>No Ads Ever</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
            <Button
              onClick={handleNeverShowAgain}
              variant="ghost"
              size="sm"
            >
              Not Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Utility component for manual install trigger (can be used in settings)
export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    const handleBeforeInstall = () => setCanInstall(true);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleClick = () => {
    if (isIOS) {
      alert('To install on iOS:\n1. Tap the Share button\n2. Select "Add to Home Screen"\n3. Tap "Add"');
    } else {
      // Remove the dismissed flag to show the prompt
      localStorage.removeItem('pwa-install-dismissed');
      window.location.reload();
    }
  };

  if (isInstalled) {
    return (
      <Alert>
        <Check className="h-4 w-4" />
        <AlertDescription>
          ✅ App is already installed on your device
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Button onClick={handleClick} variant="outline" className="w-full">
      <Download className="w-4 h-4 mr-2" />
      {isIOS ? 'Install Instructions' : 'Install App'}
    </Button>
  );
}
