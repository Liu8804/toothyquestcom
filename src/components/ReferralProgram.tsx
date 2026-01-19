import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Copy, Check, Send, Users, Trophy, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReferralStats {
  referral_code: string | null;
  total_referrals: number;
  completed_referrals: number;
  pending_referrals: number;
  rewards_earned: number;
}

export const ReferralProgram = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [sending, setSending] = useState(false);

  const fetchStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("referral", {
        body: { action: "get-stats" },
      });

      if (response.error) throw response.error;
      
      if (!response.data.referral_code) {
        // Generate a code if none exists
        const genResponse = await supabase.functions.invoke("referral", {
          body: { action: "generate" },
        });
        if (genResponse.data?.referral_code) {
          setStats({
            ...response.data,
            referral_code: genResponse.data.referral_code,
          });
          return;
        }
      }
      
      setStats(response.data);
    } catch (error: any) {
      console.error("Error fetching referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchStats();
    }
  }, [isOpen, user]);

  const copyCode = () => {
    if (stats?.referral_code) {
      navigator.clipboard.writeText(stats.referral_code);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = () => {
    const url = `https://toothyquestcom.lovable.app?ref=${stats?.referral_code}`;
    if (navigator.share) {
      navigator.share({
        title: "Join ToothyQuest!",
        text: "Make brushing teeth fun for your kids! Use my referral code and we both get a free month!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success("Share link copied!");
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !stats?.referral_code) return;
    
    setSending(true);
    try {
      const response = await supabase.functions.invoke("referral", {
        body: {
          action: "send-invite",
          invite_email: inviteEmail,
          referral_code: stats.referral_code,
        },
      });

      if (response.error) throw response.error;
      
      toast.success("Invitation sent!");
      setInviteEmail("");
    } catch (error: any) {
      toast.error("Failed to send invitation");
      console.error("Error sending invite:", error);
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-accent to-star text-white rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Gift className="w-4 h-4 mr-2" />
        Refer & Earn
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Gift className="w-6 h-6 text-accent" />
                  Refer Friends
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Hero */}
              <div className="bg-gradient-to-r from-accent/20 to-star/20 rounded-2xl p-4 mb-6 text-center">
                <Sparkles className="w-12 h-12 text-star mx-auto mb-2" />
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Give a Month, Get a Month!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Share ToothyQuest and you both get a FREE month of Premium!
                </p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : (
                <>
                  {/* Referral Code */}
                  <Card className="mb-4 border-2 border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">
                        Your Referral Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-xl px-4 py-3 font-mono text-xl font-bold tracking-widest text-center">
                          {stats?.referral_code || "Loading..."}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyCode}
                          className="rounded-xl"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={shareLink}
                        className="w-full mt-3 bg-gradient-to-r from-primary to-secondary"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Share Link
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.completed_referrals || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Referred</p>
                    </div>
                    <div className="bg-star/10 rounded-xl p-3 text-center">
                      <Trophy className="w-5 h-5 text-star mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.rewards_earned || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Rewards</p>
                    </div>
                    <div className="bg-accent/10 rounded-xl p-3 text-center">
                      <Gift className="w-5 h-5 text-accent mx-auto mb-1" />
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.pending_referrals || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>

                  {/* Send Invite */}
                  <Card className="border-2 border-accent/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Email Invite
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="friend@email.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          className="rounded-xl"
                        />
                        <Button
                          onClick={sendInvite}
                          disabled={!inviteEmail || sending}
                          className="rounded-xl"
                        >
                          {sending ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReferralProgram;
