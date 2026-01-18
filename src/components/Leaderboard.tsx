import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  Users,
  Eye,
  EyeOff,
  UserPlus,
  UserMinus,
  X,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChildId?: string;
  childName?: string;
}

const Leaderboard = ({ isOpen, onClose, selectedChildId, childName }: LeaderboardProps) => {
  const {
    leaderboard,
    myProfile,
    loading,
    joinLeaderboard,
    toggleVisibility,
    leaveLeaderboard,
    getMyRank,
  } = useLeaderboard(selectedChildId);

  const [displayName, setDisplayName] = useState(childName || "");
  const [isJoining, setIsJoining] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoin = async () => {
    if (!displayName.trim()) return;
    setIsJoining(true);
    await joinLeaderboard(displayName.trim());
    setIsJoining(false);
    setShowJoinForm(false);
  };

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave the leaderboard?")) {
      await leaveLeaderboard();
    }
  };

  const myRank = getMyRank();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-300";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-300";
      default:
        return "bg-card border-border";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm overflow-y-auto"
      >
        <div className="min-h-screen p-4 md:p-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <Trophy className="w-8 h-8 text-star" />
                Leaderboard
              </h1>
              <p className="text-muted-foreground">See how you compare with other tooth champions!</p>
            </div>
            <Button variant="outline" onClick={onClose} className="rounded-full">
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>

          {/* Privacy Notice */}
          <Card className="rounded-2xl mb-6 bg-muted/50 border-dashed">
            <CardContent className="p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Privacy First</p>
                <p className="text-muted-foreground">
                  Joining is optional. Only display names you choose are shown - never real names or personal info.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* My Status Card */}
          {selectedChildId && (
            <Card className="rounded-3xl mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Your Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-20 rounded-xl" />
                ) : myProfile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {myRank && getRankIcon(myRank)}
                        <div>
                          <p className="font-bold">{myProfile.display_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {myProfile.is_public ? "Visible on leaderboard" : "Hidden from leaderboard"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {myProfile.is_public ? (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={myProfile.is_public}
                          onCheckedChange={toggleVisibility}
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleLeave}
                        className="rounded-full text-destructive hover:text-destructive"
                      >
                        <UserMinus className="w-4 h-4 mr-1" />
                        Leave
                      </Button>
                    </div>
                  </div>
                ) : showJoinForm ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose a fun display name for the leaderboard (not your real name):
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g., SparkleSmile123"
                        className="rounded-xl"
                        maxLength={20}
                      />
                      <Button
                        onClick={handleJoin}
                        disabled={!displayName.trim() || isJoining}
                        className="rounded-full"
                      >
                        {isJoining ? "Joining..." : "Join"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowJoinForm(false)}
                        className="rounded-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">
                      You're not on the leaderboard yet. Join to compete with others!
                    </p>
                    <Button onClick={() => setShowJoinForm(true)} className="rounded-full gap-2">
                      <UserPlus className="w-4 h-4" />
                      Join Leaderboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Leaderboard List */}
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-star" />
                Top Tooth Champions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">
                    No one has joined the leaderboard yet. Be the first!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => {
                    const isMe = entry.child_id === selectedChildId;
                    return (
                      <motion.div
                        key={entry.child_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${getRankBg(entry.rank)} ${isMe ? "ring-2 ring-primary ring-offset-2" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          {getRankIcon(entry.rank)}
                          <span className="text-3xl">{entry.avatar_emoji || "🦷"}</span>
                          <div>
                            <p className="font-bold flex items-center gap-2">
                              {entry.display_name}
                              {isMe && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.quests_completed} quests • {entry.badges_earned} badges
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-primary">
                            {entry.total_xp.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">XP</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Leaderboard;
