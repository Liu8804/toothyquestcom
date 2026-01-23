import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Database, Share2, Bell, MapPin, Camera, ArrowLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface PrivacyItem {
  icon: React.ReactNode;
  category: string;
  dataType: string;
  collected: boolean;
  linkedToIdentity: boolean;
  tracking: boolean;
  purpose: string;
}

const AppPrivacy = () => {
  const { t } = useTranslation();

  const privacyItems: PrivacyItem[] = [
    {
      icon: <Database className="w-6 h-6" />,
      category: "Data Not Collected",
      dataType: "Personal Information",
      collected: false,
      linkedToIdentity: false,
      tracking: false,
      purpose: "We do not collect names, emails, or personal details from children."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      category: "Data Not Collected", 
      dataType: "Location",
      collected: false,
      linkedToIdentity: false,
      tracking: false,
      purpose: "ToothyQuest never accesses or stores your location."
    },
    {
      icon: <Camera className="w-6 h-6" />,
      category: "Data Not Collected",
      dataType: "Photos or Videos",
      collected: false,
      linkedToIdentity: false,
      tracking: false,
      purpose: "We don't request camera or photo library access."
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      category: "Data Not Shared",
      dataType: "Third Party Sharing",
      collected: false,
      linkedToIdentity: false,
      tracking: false,
      purpose: "We never share or sell any data to third parties."
    },
    {
      icon: <Bell className="w-6 h-6" />,
      category: "Optional Data",
      dataType: "Push Notifications",
      collected: true,
      linkedToIdentity: false,
      tracking: false,
      purpose: "Optional reminders for brushing times. You can disable anytime."
    },
    {
      icon: <Database className="w-6 h-6" />,
      category: "App Functionality",
      dataType: "Progress Data",
      collected: true,
      linkedToIdentity: false,
      tracking: false,
      purpose: "Quest progress, badges, and streaks stored locally and in your account."
    }
  ];

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
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">App Privacy</h1>
            <p className="text-sm text-muted-foreground">How ToothyQuest handles your data</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 mb-8">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Privacy First 🛡️
              </h2>
              <p className="text-muted-foreground">
                ToothyQuest is designed with children's privacy as our top priority.
                We collect minimal data and never share it with third parties.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-8 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-300">COPPA Compliant</h3>
            <p className="text-sm text-green-700 dark:text-green-400">
              Designed for children under 13 with parental controls
            </p>
          </div>
        </motion.div>

        {/* Privacy Items */}
        <h3 className="font-display text-lg font-bold text-foreground mb-4">
          Data Practices
        </h3>
        
        <div className="space-y-3">
          {privacyItems.map((item, index) => (
            <motion.div
              key={item.dataType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={`border ${item.collected ? 'border-amber-200 dark:border-amber-800' : 'border-green-200 dark:border-green-800'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.collected 
                        ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400' 
                        : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground">{item.dataType}</span>
                        {item.collected ? (
                          <span className="text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">
                            Minimal
                          </span>
                        ) : (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <X className="w-3 h-3" /> Not Collected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.purpose}</p>
                      
                      {/* Privacy indicators */}
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {item.linkedToIdentity ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Linked to Identity
                        </span>
                        <span className="flex items-center gap-1">
                          {item.tracking ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          Used for Tracking
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Developer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-bold text-foreground mb-2">
                Questions About Privacy?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Contact us at marliudlewis@gmail.com
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/privacy-policy">
                  <Button variant="outline" size="sm">
                    Full Privacy Policy
                  </Button>
                </Link>
                <Link to="/terms-of-service">
                  <Button variant="outline" size="sm">
                    Terms of Service
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AppPrivacy;
