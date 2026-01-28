import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Link2,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
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

interface TesterInvitation {
  id: string;
  code: string;
  email: string | null;
  note: string | null;
  is_active: boolean;
  max_uses: number;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
}

export const TesterInvitationsAdmin = () => {
  const { user } = useAuth();
  const [invitations, setInvitations] = useState<TesterInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteNote, setNewInviteNote] = useState("");
  const [newInviteMaxUses, setNewInviteMaxUses] = useState("1");
  const [newInviteExpiresDays, setNewInviteExpiresDays] = useState("30");

  const fetchInvitations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("tester_invitations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      toast.error("Failed to load invitations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInvitations();
  }, [fetchInvitations]);

  const handleCreateInvitation = async () => {
    setIsCreating(true);
    try {
      // Generate code
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_tester_invite_code"
      );

      if (codeError) throw codeError;

      const expiresAt = newInviteExpiresDays
        ? new Date(Date.now() + parseInt(newInviteExpiresDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase.from("tester_invitations").insert({
        code: codeData,
        email: newInviteEmail || null,
        note: newInviteNote || null,
        max_uses: parseInt(newInviteMaxUses) || 1,
        expires_at: expiresAt,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success("Invitation created successfully!");
      setShowCreateDialog(false);
      resetForm();
      void fetchInvitations();
    } catch (error) {
      console.error("Failed to create invitation:", error);
      toast.error("Failed to create invitation");
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewInviteEmail("");
    setNewInviteNote("");
    setNewInviteMaxUses("1");
    setNewInviteExpiresDays("30");
  };

  const handleDeleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tester_invitations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Invitation deleted");
      void fetchInvitations();
    } catch (error) {
      console.error("Failed to delete invitation:", error);
      toast.error("Failed to delete invitation");
    }
  };

  const handleToggleActive = async (invitation: TesterInvitation) => {
    try {
      const { error } = await supabase
        .from("tester_invitations")
        .update({ is_active: !invitation.is_active })
        .eq("id", invitation.id);

      if (error) throw error;
      toast.success(invitation.is_active ? "Invitation deactivated" : "Invitation activated");
      void fetchInvitations();
    } catch (error) {
      console.error("Failed to toggle invitation:", error);
      toast.error("Failed to update invitation");
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/tester-invite?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success("Invite link copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getInviteStatus = (invitation: TesterInvitation) => {
    if (!invitation.is_active) {
      return { label: "Inactive", variant: "secondary" as const };
    }
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { label: "Expired", variant: "destructive" as const };
    }
    if (invitation.uses_count >= invitation.max_uses) {
      return { label: "Maxed", variant: "outline" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  const publicTesterLink = "https://toothyquest.com/become-tester";
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicTesterLink);
    setCopiedPublicLink(true);
    toast.success("Public tester link copied!");
    setTimeout(() => setCopiedPublicLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Public Tester Link Card */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Link2 className="w-5 h-5 text-purple-500" />
            Public Tester Link
          </CardTitle>
          <CardDescription>
            Share this single link with anyone — they'll automatically become a tester on signup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={publicTesterLink}
              className="font-mono text-sm bg-background"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyPublicLink}
              className="shrink-0"
            >
              {copiedPublicLink ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(publicTesterLink, "_blank")}
              className="shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No manual approval needed — testers get 7 days of full access automatically
          </p>
        </CardContent>
      </Card>

      {/* Individual Invite Codes Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-pink-500" />
                Individual Invite Codes
              </CardTitle>
              <CardDescription>
                Create unique codes for tracking specific testers (optional)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchInvitations}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Create Code
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No individual codes yet</p>
              <p className="text-sm">Use the public link above, or create individual codes for tracking</p>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => {
                const status = getInviteStatus(invitation);

                return (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {invitation.code}
                        </code>
                        {invitation.note && (
                          <div className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">
                            {invitation.note}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {invitation.uses_count} / {invitation.max_uses}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">
                        {invitation.expires_at
                          ? format(new Date(invitation.expires_at), "MMM d, yyyy")
                          : "Never"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyInviteLink(invitation.code)}
                        >
                          {copiedCode === invitation.code ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            window.open(`/tester-invite?code=${invitation.code}`, "_blank")
                          }
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteInvitation(invitation.id)}
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

        {/* Create Invitation Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Individual Invite Code</DialogTitle>
              <DialogDescription>
                Generate a unique code for tracking a specific tester
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tester@example.com"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For reference only - anyone with the link can use it
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">Note (optional)</Label>
                <Textarea
                  id="note"
                  placeholder="e.g., Influencer partner, Beta tester..."
                  value={newInviteNote}
                  onChange={(e) => setNewInviteNote(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={newInviteMaxUses}
                    onChange={(e) => setNewInviteMaxUses(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresDays">Expires in (days)</Label>
                  <Input
                    id="expiresDays"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={newInviteExpiresDays}
                    onChange={(e) => setNewInviteExpiresDays(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateInvitation} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Code"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </div>
  );
};
