import { motion } from "framer-motion";
import {
  Download,
  TrendingUp,
  Flame,
  Calendar,
  Gamepad2,
  BookOpen,
  Timer,
  BarChart3,
  FileJson,
  FileSpreadsheet,
  X,
  Activity,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParentAnalytics } from "@/hooks/useParentAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface ParentAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChildId?: string;
}

const ParentAnalyticsDashboard = ({
  isOpen,
  onClose,
  selectedChildId,
}: ParentAnalyticsDashboardProps) => {
  const {
    analyticsEvents,
    retentionMetrics,
    loading,
    handleExportJSON,
    handleExportCSV,
  } = useParentAnalytics(selectedChildId);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track engagement, retention metrics, and export your data
            </p>
          </div>
          <Button variant="outline" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>

        <Tabs defaultValue="retention" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl h-14">
            <TabsTrigger value="retention" className="rounded-xl text-base">
              <Flame className="w-4 h-4 mr-2" />
              Retention
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-xl text-base">
              <Activity className="w-4 h-4 mr-2" />
              Activity Log
            </TabsTrigger>
            <TabsTrigger value="export" className="rounded-xl text-base">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </TabsTrigger>
          </TabsList>

          {/* Retention Metrics Tab */}
          <TabsContent value="retention" className="space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-3xl" />
                ))}
              </div>
            ) : (
              <>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Flame className="w-8 h-8" />
                          <span className="text-4xl font-display font-bold">
                            {retentionMetrics.currentStreak}
                          </span>
                        </div>
                        <p className="text-primary-foreground/80">Current Streak</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="rounded-3xl bg-gradient-to-br from-accent to-accent/80 text-accent-foreground border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Target className="w-8 h-8" />
                          <span className="text-4xl font-display font-bold">
                            {retentionMetrics.longestStreak}
                          </span>
                        </div>
                        <p className="text-accent-foreground/80">Longest Streak</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="rounded-3xl bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-8 h-8" />
                          <span className="text-4xl font-display font-bold">
                            {retentionMetrics.totalActiveDays}
                          </span>
                        </div>
                        <p className="text-secondary-foreground/80">Active Days</p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="rounded-3xl bg-gradient-to-br from-star to-star/80 text-foreground border-0">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <TrendingUp className="w-8 h-8" />
                          <span className="text-4xl font-display font-bold">
                            {retentionMetrics.avgSessionsPerDay.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-foreground/80">Avg/Day</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Card className="rounded-3xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Gamepad2 className="w-5 h-5 text-primary" />
                          Games Played
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-4xl font-display font-bold text-primary">
                          {retentionMetrics.totalGamesPlayed}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Card className="rounded-3xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <BookOpen className="w-5 h-5 text-accent" />
                          Stories Read
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-4xl font-display font-bold text-accent">
                          {retentionMetrics.totalStoriesRead}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Card className="rounded-3xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Timer className="w-5 h-5 text-secondary" />
                          Brushing Sessions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <span className="text-4xl font-display font-bold text-secondary">
                          {retentionMetrics.totalBrushingSessions}
                        </span>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Weekly Activity Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Weekly Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-2 h-40">
                        {retentionMetrics.weeklyActivity.map((day, index) => {
                          const maxCount = Math.max(
                            ...retentionMetrics.weeklyActivity.map((d) => d.count),
                            1
                          );
                          const heightPercent = (day.count / maxCount) * 100;
                          return (
                            <div
                              key={index}
                              className="flex-1 flex flex-col items-center gap-2"
                            >
                              <div
                                className="w-full bg-primary/20 rounded-xl relative overflow-hidden"
                                style={{ height: "120px" }}
                              >
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${heightPercent}%` }}
                                  transition={{ delay: 0.9 + index * 0.05, duration: 0.5 }}
                                  className="absolute bottom-0 w-full bg-gradient-to-t from-primary to-primary/60 rounded-xl"
                                />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground">
                                {day.day}
                              </span>
                              <span className="text-sm font-bold">{day.count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Events ({analyticsEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-xl" />
                    ))}
                  </div>
                ) : analyticsEvents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No analytics events recorded yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {analyticsEvents.slice(0, 50).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-xl"
                      >
                        <div className="flex-1">
                          <p className="font-medium capitalize">
                            {event.event_name.replace(/_/g, " ")}
                          </p>
                          {event.event_data && Object.keys(event.event_data).length > 0 && (
                            <p className="text-sm text-muted-foreground truncate max-w-md">
                              {Object.entries(event.event_data)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(", ")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(event.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-6">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-primary" />
                  Export My Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Download all your data including analytics events, children's progress,
                  badges, brushing sessions, and game scores.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="rounded-2xl border-2 border-dashed hover:border-primary transition-colors cursor-pointer group">
                      <CardContent
                        className="p-6 text-center"
                        onClick={handleExportJSON}
                      >
                        <FileJson className="w-12 h-12 mx-auto mb-4 text-primary group-hover:scale-110 transition-transform" />
                        <h3 className="font-display font-bold text-lg mb-2">
                          Export as JSON
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Structured data format, ideal for developers or data analysis
                        </p>
                        <Button className="mt-4 rounded-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download JSON
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="rounded-2xl border-2 border-dashed hover:border-accent transition-colors cursor-pointer group">
                      <CardContent
                        className="p-6 text-center"
                        onClick={handleExportCSV}
                      >
                        <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-accent group-hover:scale-110 transition-transform" />
                        <h3 className="font-display font-bold text-lg mb-2">
                          Export as CSV
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Spreadsheet format, open in Excel or Google Sheets
                        </p>
                        <Button className="mt-4 rounded-full" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download CSV
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                <div className="bg-muted rounded-2xl p-4 mt-6">
                  <h4 className="font-medium mb-2">What's included in your export:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>✅ All analytics events</li>
                    <li>✅ Children profiles and progress</li>
                    <li>✅ Quest completion history</li>
                    <li>✅ Earned badges</li>
                    <li>✅ Brushing session records</li>
                    <li>✅ Game scores and achievements</li>
                    <li>✅ Retention metrics summary</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ParentAnalyticsDashboard;
