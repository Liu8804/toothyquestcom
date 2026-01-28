import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  FlaskConical,
  Plus,
  Trash2,
  Clock,
  User,
  Activity,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface TesterAccount {
  id: string;
  user_id: string;
  trial_start_at: string;
  trial_end_at: string;
  is_active: boolean;
  note: string | null;
  created_at: string;
}

interface TesterUsageSummary {
  user_id: string;
  total_screens_visited: number;
  total_time_spent_seconds: number;
  quests_completed: number;
  games_played: number;
  last_activity_at: string | null;
}

export const TesterAccountsAdmin = () => {
  const { user } = useAuth();
  const [testers, setTesters] = useState<TesterAccount[]>([]);
  const [usageSummaries, setUsageSummaries] = useState<Record<string, TesterUsageSummary>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTesterEmail, setNewTesterEmail] = useState("");
  const [newTesterNote, setNewTesterNote] = useState("");
  const [selectedTester, setSelectedTester] = useState<TesterAccount | null>(null);

  const fetchTesters = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tester_accounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTesters(data || []);

      // Fetch usage summaries
      if (data && data.length > 0) {
        const { data: summaries } = await supabase
          .from("tester_activity_summary")
          .select("*");

        if (summaries) {
          const summaryMap: Record<string, TesterUsageSummary> = {};
          summaries.forEach((s) => {
            summaryMap[s.user_id] = s;
          });
          setUsageSummaries(summaryMap);
        }
      }
    } catch (error) {
      console.error("Failed to fetch testers:", error);
      toast.error("Failed to load tester accounts");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTesters();
  }, [fetchTesters]);

  const handleCreateTester = async () => {
    if (!newTesterEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsCreating(true);
    try {
      // First, find the user by email
      // Note: This requires admin access - in production you'd use an edge function
      const { data: userData, error: userError } = await supabase.rpc(
        "admin_get_all_profiles"
      );

      if (userError) throw userError;

      // Find user with matching email (would need to look up in auth.users)
      // For now, we'll create with user_id directly if provided as UUID
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        newTesterEmail.trim()
      );

      const userId = isUuid ? newTesterEmail.trim() : null;

      if (!userId) {
        toast.error("Please enter a valid user UUID. Email lookup requires additional setup.");
        setIsCreating(false);
        return;
      }

      const { error } = await supabase.from("tester_accounts").insert({
        user_id: userId,
        note: newTesterNote || null,
        created_by: user?.id,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This user is already a tester");
        } else {
          throw error;
        }
      } else {
        toast.success("Tester account created successfully!");
        setShowCreateDialog(false);
        setNewTesterEmail("");
        setNewTesterNote("");
        void fetchTesters();
      }
    } catch (error) {
      console.error("Failed to create tester:", error);
      toast.error("Failed to create tester account");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTester = async (testerId: string) => {
    try {
      const { error } = await supabase
        .from("tester_accounts")
        .delete()
        .eq("id", testerId);

      if (error) throw error;
      toast.success("Tester account removed");
      void fetchTesters();
    } catch (error) {
      console.error("Failed to delete tester:", error);
      toast.error("Failed to remove tester account");
    }
  };

  const handleToggleActive = async (tester: TesterAccount) => {
    try {
      const { error } = await supabase
        .from("tester_accounts")
        .update({ is_active: !tester.is_active })
        .eq("id", tester.id);

      if (error) throw error;
      toast.success(tester.is_active ? "Tester deactivated" : "Tester activated");
      void fetchTesters();
    } catch (error) {
      console.error("Failed to toggle tester status:", error);
      toast.error("Failed to update tester status");
    }
  };

  const getTrialStatus = (tester: TesterAccount) => {
    const now = new Date();
    const endDate = new Date(tester.trial_end_at);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (!tester.is_active) {
      return { label: "Inactive", variant: "secondary" as const };
    }
    if (daysRemaining <= 0) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (daysRemaining === 1) {
      return { label: "Last Day", variant: "outline" as const, className: "border-amber-500 text-amber-600" };
    }
    return { label: `${daysRemaining}d left`, variant: "default" as const };
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-purple-500" />
              Tester Accounts
            </CardTitle>
            <CardDescription>
              Manage 7-day trial accounts for parents and kids
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTesters}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Tester
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {testers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tester accounts yet</p>
            <p className="text-sm">Click "Add Tester" to create one</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trial Period</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testers.map((tester) => {
                const status = getTrialStatus(tester);
                const usage = usageSummaries[tester.user_id];

                return (
                  <TableRow key={tester.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-mono text-xs truncate max-w-[120px]">
                            {tester.user_id.substring(0, 8)}...
                          </div>
                          {tester.note && (
                            <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {tester.note}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className={(status as { className?: string }).className}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(tester.trial_start_at), "MMM d")} -{" "}
                          {format(new Date(tester.trial_end_at), "MMM d")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {usage ? (
                        <div className="text-xs space-y-0.5">
                          <div>{usage.total_screens_visited} screens</div>
                          <div>{formatDuration(usage.total_time_spent_seconds)}</div>
                          <div>
                            {usage.quests_completed}Q / {usage.games_played}G
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No data</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setSelectedTester(tester)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleToggleActive(tester)}
                        >
                          <Activity
                            className={`w-3.5 h-3.5 ${
                              tester.is_active ? "text-green-500" : "text-muted-foreground"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTester(tester.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {/* Create Tester Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tester</DialogTitle>
              <DialogDescription>
                Create a 7-day full access trial for a user
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (UUID)</Label>
                <Input
                  id="userId"
                  placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                  value={newTesterEmail}
                  onChange={(e) => setNewTesterEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the user's UUID from the profiles table
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="e.g., Family friend, Influencer partner..."
                  value={newTesterNote}
                  onChange={(e) => setNewTesterNote(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTester} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Tester"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tester Details Dialog */}
        <Dialog
          open={!!selectedTester}
          onOpenChange={() => setSelectedTester(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Tester Details</DialogTitle>
            </DialogHeader>
            {selectedTester && (
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="font-mono text-sm">{selectedTester.user_id}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Trial Start</Label>
                    <p className="text-sm">
                      {format(new Date(selectedTester.trial_start_at), "PPp")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Trial End</Label>
                    <p className="text-sm">
                      {format(new Date(selectedTester.trial_end_at), "PPp")}
                    </p>
                  </div>
                </div>
                {selectedTester.note && (
                  <div>
                    <Label className="text-muted-foreground">Note</Label>
                    <p className="text-sm">{selectedTester.note}</p>
                  </div>
                )}
                {usageSummaries[selectedTester.user_id] && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-muted-foreground mb-2 block">
                      Usage Summary
                    </Label>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Screens:</span>{" "}
                        {usageSummaries[selectedTester.user_id].total_screens_visited}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Time:</span>{" "}
                        {formatDuration(
                          usageSummaries[selectedTester.user_id].total_time_spent_seconds
                        )}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quests:</span>{" "}
                        {usageSummaries[selectedTester.user_id].quests_completed}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Games:</span>{" "}
                        {usageSummaries[selectedTester.user_id].games_played}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
