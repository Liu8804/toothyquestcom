import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  RefreshCw, 
  Gift, 
  Calendar,
  Users,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface PromoCode {
  id: string;
  code: string;
  note: string | null;
  created_at: string;
  expires_at: string | null;
  max_redemptions: number | null;
  redemption_count: number;
  is_active: boolean;
}

interface CodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  redeemed_at: string;
}

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const segments = [];
  for (let s = 0; s < 4; s++) {
    let segment = "";
    for (let i = 0; i < 4; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    segments.push(segment);
  }
  return `TQ-${segments.join("-")}`;
};

const PromoCodesAdmin = () => {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<CodeRedemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New code form state
  const [newCode, setNewCode] = useState(generateCode());
  const [note, setNote] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState("");
  
  // Bulk generation state
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkNote, setBulkNote] = useState("");
  const [bulkMaxRedemptions, setBulkMaxRedemptions] = useState<number>(1);
  const [bulkExpiresAt, setBulkExpiresAt] = useState("");

  const fetchCodes = async () => {
    setIsLoading(true);
    try {
      // Use service role via edge function for admin access
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) return;

      // For now, we'll use a direct query - admins will see this via RLS
      // Note: This requires admin role to work due to RLS policies
      const { data, error } = await supabase
        .from("unlock_codes" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching codes:", error);
        toast.error("Failed to load promo codes");
        return;
      }

      setCodes((data as unknown as PromoCode[]) || []);

      // Fetch redemptions
      const { data: redemptionData } = await supabase
        .from("code_redemptions" as any)
        .select("*")
        .order("redeemed_at", { ascending: false });

      setRedemptions((redemptionData as unknown as CodeRedemption[]) || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      toast.error("Code is required");
      return;
    }

    setIsCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const { error } = await supabase
        .from("unlock_codes" as any)
        .insert({
          code: newCode.trim().toUpperCase(),
          note: note.trim() || null,
          max_redemptions: maxRedemptions || null,
          expires_at: expiresAt || null,
          is_active: true,
          created_by: session?.session?.user?.id,
        });

      if (error) {
        console.error("Error creating code:", error);
        toast.error("Failed to create code");
        return;
      }

      toast.success("Promo code created!");
      setNewCode(generateCode());
      setNote("");
      setMaxRedemptions(1);
      setExpiresAt("");
      fetchCodes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create code");
    } finally {
      setIsCreating(false);
    }
  };

  const handleBulkCreate = async () => {
    if (bulkCount < 1 || bulkCount > 100) {
      toast.error("Please enter a count between 1 and 100");
      return;
    }

    setIsBulkCreating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      const codesToCreate = [];
      for (let i = 0; i < bulkCount; i++) {
        codesToCreate.push({
          code: generateCode(),
          note: bulkNote.trim() || `Bulk generated ${i + 1}/${bulkCount}`,
          max_redemptions: bulkMaxRedemptions || null,
          expires_at: bulkExpiresAt || null,
          is_active: true,
          created_by: session?.session?.user?.id,
        });
      }

      const { error } = await supabase
        .from("unlock_codes" as any)
        .insert(codesToCreate);

      if (error) {
        console.error("Error creating bulk codes:", error);
        toast.error("Failed to create codes");
        return;
      }

      toast.success(`Created ${bulkCount} promo codes!`);
      setBulkNote("");
      setBulkCount(10);
      setBulkMaxRedemptions(1);
      setBulkExpiresAt("");
      fetchCodes();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create codes");
    } finally {
      setIsBulkCreating(false);
    }
  };

  const handleToggleActive = async (code: PromoCode) => {
    try {
      const { error } = await supabase
        .from("unlock_codes" as any)
        .update({ is_active: !code.is_active })
        .eq("id", code.id);

      if (error) {
        toast.error("Failed to update code");
        return;
      }

      toast.success(code.is_active ? "Code deactivated" : "Code activated");
      fetchCodes();
    } catch (error) {
      toast.error("Failed to update code");
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return;

    try {
      const { error } = await supabase
        .from("unlock_codes" as any)
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete code");
        return;
      }

      toast.success("Code deleted");
      fetchCodes();
    } catch (error) {
      toast.error("Failed to delete code");
    }
  };

  const getRedemptionCount = (codeId: string) => {
    return redemptions.filter(r => r.code_id === codeId).length;
  };

  const handleExportCSV = () => {
    if (codes.length === 0) {
      toast.error("No codes to export");
      return;
    }

    // Build CSV content
    const headers = ["Code", "Note", "Max Redemptions", "Redemption Count", "Expires At", "Is Active", "Created At"];
    const rows = codes.map(code => [
      code.code,
      `"${(code.note || '').replace(/"/g, '""')}"`,
      code.max_redemptions || "Unlimited",
      code.redemption_count,
      code.expires_at ? format(new Date(code.expires_at), "yyyy-MM-dd HH:mm") : "Never",
      code.is_active ? "Yes" : "No",
      format(new Date(code.created_at), "yyyy-MM-dd HH:mm")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `promo-codes-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${codes.length} codes to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Create New Code */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Create Promo Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="TQ-XXXX-XXXX-XXXX"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setNewCode(generateCode())}
                  title="Generate new code"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g., Influencer giveaway"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxRedemptions">Max Redemptions</Label>
              <Input
                id="maxRedemptions"
                type="number"
                min="1"
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At (optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleCreateCode}
            disabled={isCreating}
            className="mt-4"
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Bulk Code Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Bulk Code Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bulkCount">Number of Codes</Label>
              <Input
                id="bulkCount"
                type="number"
                min="1"
                max="100"
                value={bulkCount}
                onChange={(e) => setBulkCount(parseInt(e.target.value) || 10)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkNote">Note (optional)</Label>
              <Input
                id="bulkNote"
                value={bulkNote}
                onChange={(e) => setBulkNote(e.target.value)}
                placeholder="e.g., Launch giveaway"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkMaxRedemptions">Max Redemptions Each</Label>
              <Input
                id="bulkMaxRedemptions"
                type="number"
                min="1"
                value={bulkMaxRedemptions}
                onChange={(e) => setBulkMaxRedemptions(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulkExpiresAt">Expires At (optional)</Label>
              <Input
                id="bulkExpiresAt"
                type="datetime-local"
                value={bulkExpiresAt}
                onChange={(e) => setBulkExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleBulkCreate}
            disabled={isBulkCreating}
            className="mt-4"
            variant="secondary"
          >
            {isBulkCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating {bulkCount} codes...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Generate {bulkCount} Codes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Promo Codes ({codes.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={codes.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={fetchCodes}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : codes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No promo codes yet. Create one above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {codes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell className="font-mono font-bold">
                        <div className="flex items-center gap-2">
                          {code.code}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopyCode(code.code, code.id)}
                          >
                            {copiedId === code.id ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {code.note || "-"}
                      </TableCell>
                      <TableCell>
                        <span className={code.redemption_count >= (code.max_redemptions || 999) ? "text-red-500" : ""}>
                          {code.redemption_count}/{code.max_redemptions || "∞"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {code.expires_at ? (
                          <span className={new Date(code.expires_at) < new Date() ? "text-red-500" : ""}>
                            {format(new Date(code.expires_at), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={code.is_active}
                          onCheckedChange={() => handleToggleActive(code)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCode(code.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Redemptions */}
      {redemptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Recent Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Redeemed At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.slice(0, 20).map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-mono text-sm">
                        {redemption.user_id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {format(new Date(redemption.redeemed_at), "MMM d, yyyy h:mm a")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromoCodesAdmin;
