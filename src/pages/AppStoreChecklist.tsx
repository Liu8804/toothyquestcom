import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Check, Circle, Image, FileText, Shield, 
  Smartphone, TestTube, Globe, Star, AlertCircle, Copy,
  ExternalLink, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  category: string;
}

const AppStoreChecklist = () => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const checklistItems: ChecklistItem[] = [
    // App Icons
    { id: "icon-1024", title: "App Icon 1024x1024", description: "Required for App Store listing", required: true, category: "icons" },
    { id: "icon-180", title: "App Icon 180x180", description: "iPhone @3x", required: true, category: "icons" },
    { id: "icon-167", title: "App Icon 167x167", description: "iPad Pro @2x", required: true, category: "icons" },
    { id: "icon-152", title: "App Icon 152x152", description: "iPad @2x", required: true, category: "icons" },
    { id: "icon-120", title: "App Icon 120x120", description: "iPhone @2x, Spotlight @3x", required: true, category: "icons" },
    { id: "icon-87", title: "App Icon 87x87", description: "Settings @3x", required: true, category: "icons" },
    { id: "icon-80", title: "App Icon 80x80", description: "Spotlight @2x", required: true, category: "icons" },
    { id: "icon-76", title: "App Icon 76x76", description: "iPad @1x", required: true, category: "icons" },
    { id: "icon-60", title: "App Icon 60x60", description: "iPhone @1x", required: true, category: "icons" },
    { id: "icon-58", title: "App Icon 58x58", description: "Settings @2x", required: true, category: "icons" },
    { id: "icon-40", title: "App Icon 40x40", description: "Spotlight @1x", required: true, category: "icons" },
    { id: "icon-29", title: "App Icon 29x29", description: "Settings @1x", required: true, category: "icons" },
    { id: "icon-20", title: "App Icon 20x20", description: "Notification @1x", required: true, category: "icons" },
    
    // Screenshots
    { id: "ss-iphone-67", title: "iPhone 6.7\" Screenshots", description: "iPhone 15 Pro Max (1290x2796)", required: true, category: "screenshots" },
    { id: "ss-iphone-65", title: "iPhone 6.5\" Screenshots", description: "iPhone 11 Pro Max (1242x2688)", required: true, category: "screenshots" },
    { id: "ss-iphone-55", title: "iPhone 5.5\" Screenshots", description: "iPhone 8 Plus (1242x2208)", required: false, category: "screenshots" },
    { id: "ss-ipad-129", title: "iPad 12.9\" Screenshots", description: "iPad Pro (2048x2732)", required: true, category: "screenshots" },
    { id: "ss-ipad-11", title: "iPad 11\" Screenshots", description: "iPad Pro 11\" (1668x2388)", required: false, category: "screenshots" },
    
    // App Store Metadata
    { id: "meta-name", title: "App Name (30 chars)", description: "ToothyQuest - Make Brushing Fun!", required: true, category: "metadata" },
    { id: "meta-subtitle", title: "Subtitle (30 chars)", description: "Dental Adventures for Kids 3-9", required: true, category: "metadata" },
    { id: "meta-description", title: "Description (4000 chars)", description: "Full app description with features", required: true, category: "metadata" },
    { id: "meta-keywords", title: "Keywords (100 chars)", description: "Search keywords, comma separated", required: true, category: "metadata" },
    { id: "meta-category", title: "Primary Category", description: "Education or Kids", required: true, category: "metadata" },
    { id: "meta-age", title: "Age Rating", description: "4+ (Made for Kids)", required: true, category: "metadata" },
    
    // Privacy & Legal
    { id: "privacy-policy", title: "Privacy Policy URL", description: "Link to privacy policy page", required: true, category: "legal" },
    { id: "privacy-nutrition", title: "App Privacy Details", description: "Data collection disclosures", required: true, category: "legal" },
    { id: "coppa", title: "COPPA Compliance", description: "Children's privacy compliance", required: true, category: "legal" },
    { id: "terms", title: "Terms of Service URL", description: "Link to terms page", required: false, category: "legal" },
    
    // Build & Technical
    { id: "build-bundle", title: "Bundle ID", description: "app.lovable.ade06b52b0914f31abbee61bf97ff696", required: true, category: "build" },
    { id: "build-version", title: "Version Number", description: "1.0.0 format", required: true, category: "build" },
    { id: "build-number", title: "Build Number", description: "Incremental integer", required: true, category: "build" },
    { id: "build-signing", title: "Code Signing", description: "Distribution certificate", required: true, category: "build" },
    { id: "build-provisioning", title: "Provisioning Profile", description: "App Store distribution", required: true, category: "build" },
    { id: "build-archive", title: "Archive Build", description: "Xcode Archive for upload", required: true, category: "build" },
    
    // Testing
    { id: "test-devices", title: "Test on Real Devices", description: "iPhone and iPad testing", required: true, category: "testing" },
    { id: "test-performance", title: "Performance Testing", description: "No crashes or memory leaks", required: true, category: "testing" },
    { id: "test-offline", title: "Offline Functionality", description: "PWA caching works", required: false, category: "testing" },
    { id: "test-review", title: "Demo Account", description: "Test account for App Review", required: false, category: "testing" },
  ];

  const categories = [
    { id: "icons", title: "App Icons", icon: <Image className="w-5 h-5" /> },
    { id: "screenshots", title: "Screenshots", icon: <Smartphone className="w-5 h-5" /> },
    { id: "metadata", title: "App Store Metadata", icon: <FileText className="w-5 h-5" /> },
    { id: "legal", title: "Privacy & Legal", icon: <Shield className="w-5 h-5" /> },
    { id: "build", title: "Build & Technical", icon: <Globe className="w-5 h-5" /> },
    { id: "testing", title: "Testing", icon: <TestTube className="w-5 h-5" /> },
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getProgress = (category: string) => {
    const items = checklistItems.filter(item => item.category === category);
    const checked = items.filter(item => checkedItems[item.id]).length;
    return { checked, total: items.length };
  };

  const getTotalProgress = () => {
    const requiredItems = checklistItems.filter(item => item.required);
    const checkedRequired = requiredItems.filter(item => checkedItems[item.id]).length;
    return { checked: checkedRequired, total: requiredItems.length };
  };

  const copyBundleId = () => {
    navigator.clipboard.writeText("app.lovable.ade06b52b0914f31abbee61bf97ff696");
    toast.success("Bundle ID copied!");
  };

  const totalProgress = getTotalProgress();
  const progressPercent = Math.round((totalProgress.checked / totalProgress.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-background to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">App Store Checklist</h1>
            <p className="text-sm text-muted-foreground">Submission requirements for iOS</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{progressPercent}%</div>
            <div className="text-xs text-muted-foreground">{totalProgress.checked}/{totalProgress.total} required</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Ready for App Store? 🚀
                  </h2>
                  <p className="text-muted-foreground">
                    Complete all required items before submission
                  </p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={copyBundleId}>
            <CardContent className="p-4 flex items-center gap-3">
              <Copy className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium text-sm">Copy Bundle ID</p>
                <p className="text-xs text-muted-foreground truncate">app.lovable...</p>
              </div>
            </CardContent>
          </Card>
          
          <Link to="/app-privacy">
            <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
              <CardContent className="p-4 flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Privacy Summary</p>
                  <p className="text-xs text-muted-foreground">View details</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Checklist by Category */}
        {categories.map((category, catIndex) => {
          const progress = getProgress(category.id);
          const items = checklistItems.filter(item => item.category === category.id);
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * catIndex }}
              className="mb-6"
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        {category.icon}
                      </div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <span className={`text-sm font-medium ${
                      progress.checked === progress.total ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {progress.checked}/{progress.total}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          checkedItems[item.id] 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <Checkbox
                          checked={checkedItems[item.id] || false}
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${
                              checkedItems[item.id] ? 'line-through text-muted-foreground' : ''
                            }`}>
                              {item.title}
                            </span>
                            {item.required && (
                              <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        {checkedItems[item.id] && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Important Notes */}
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-300 mb-1">
                  Before Submitting
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• Export project to GitHub and run `npx cap sync`</li>
                  <li>• Build archive in Xcode with Release configuration</li>
                  <li>• Upload via Transporter or Xcode Organizer</li>
                  <li>• Allow 24-48 hours for App Review (kids category may take longer)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AppStoreChecklist;
