import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, Share, Plus, MoreVertical, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
    
    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone || isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4 font-display">
            🎉 App Installed!
          </h1>
          <p className="text-muted-foreground mb-6">
            ToothyQuest is now on your home screen. Open it anytime for dental adventures!
          </p>
          <Button onClick={() => window.location.href = '/'} className="gap-2">
            Start Playing <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-10"
        >
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">🦷</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 font-display">
            Install ToothyQuest
          </h1>
          <p className="text-lg text-muted-foreground">
            Add ToothyQuest to your home screen for the best experience!
          </p>
        </motion.div>

        {/* Android / Chrome Install Button */}
        {deferredPrompt && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Button 
              onClick={handleInstall}
              size="lg"
              className="w-full text-lg py-6 gap-3"
            >
              <Download className="w-6 h-6" />
              Install Now
            </Button>
          </motion.div>
        )}

        {/* iOS Instructions */}
        {isIOS && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold">iPhone & iPad</h2>
                </div>
                
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Tap the Share button</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Look for <Share className="w-4 h-4" /> at the bottom of Safari
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Scroll and tap "Add to Home Screen"</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Look for <Plus className="w-4 h-4" /> Add to Home Screen
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Tap "Add"</p>
                      <p className="text-sm text-muted-foreground">
                        ToothyQuest will appear on your home screen!
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Android Instructions (fallback if no prompt) */}
        {isAndroid && !deferredPrompt && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Android</h2>
                </div>
                
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Tap the menu button</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        Look for <MoreVertical className="w-4 h-4" /> in your browser
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Tap "Add to Home screen" or "Install app"</p>
                      <p className="text-sm text-muted-foreground">
                        The option may vary by browser
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Confirm installation</p>
                      <p className="text-sm text-muted-foreground">
                        ToothyQuest will appear on your home screen!
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Desktop Instructions */}
        {!isIOS && !isAndroid && !deferredPrompt && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <Download className="w-5 h-5 text-purple-500" />
                  </div>
                  <h2 className="text-xl font-semibold">Desktop Browser</h2>
                </div>
                
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Look for the install icon</p>
                      <p className="text-sm text-muted-foreground">
                        In Chrome, look for the + icon in the address bar
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Click "Install"</p>
                      <p className="text-sm text-muted-foreground">
                        ToothyQuest will open as a standalone app!
                      </p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Benefits */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-4 text-center">Why Install?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="pt-6">
                <span className="text-3xl mb-2 block">⚡</span>
                <p className="font-medium">Faster</p>
                <p className="text-sm text-muted-foreground">Loads instantly</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <span className="text-3xl mb-2 block">📱</span>
                <p className="font-medium">Full Screen</p>
                <p className="text-sm text-muted-foreground">No browser bar</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <span className="text-3xl mb-2 block">🌐</span>
                <p className="font-medium">Works Offline</p>
                <p className="text-sm text-muted-foreground">Play anytime</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <Button variant="ghost" onClick={() => window.location.href = '/'}>
            ← Back to ToothyQuest
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
