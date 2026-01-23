import { useMemo, useState } from "react";
import { Shield, X, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useEntitlementStatus } from "@/hooks/useEntitlementStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OWNER_EMAILS = new Set([
  "marliudlewis@gmail.com",
  "marlonlewisbradhsaw@gmail.com",
  "karlaelia976@gmail.com",
]);

const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

/**
 * Visible to your owner/test accounts even when access is blocked.
 * Shows ONLY non-sensitive booleans + timestamps.
 */
const OwnerDiagnosticsPanel = () => {
  const { user, session } = useAuth();
  const { isPurchased, isCheckingPurchase, lastPurchaseCheckAt, refreshPurchaseStatus } = usePurchase();
  const { isAdmin, isAdminLoading, adminError, adminCheckedAt, refreshAdminStatus } = useAdminStatus();
  const {
    hasEntitlement,
    entitlementLoading,
    entitlementError,
    entitlementCheckedAt,
    refreshEntitlementStatus,
  } = useEntitlementStatus();

  const [open, setOpen] = useState(true);

  const canShow = useMemo(() => {
    const email = user?.email?.toLowerCase();
    return !!user && !!email && OWNER_EMAILS.has(email);
  }, [user]);

  if (!canShow) return null;

  const handleRefresh = async () => {
    await Promise.all([refreshAdminStatus(), refreshEntitlementStatus()]);
    refreshPurchaseStatus();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))]">
      {open ? (
        <Card className="shadow-card border-border/60 bg-background/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Owner Access Diagnostics
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close diagnostics">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div className="text-muted-foreground">Email</div>
              <div className="font-medium truncate">{user?.email}</div>

              <div className="text-muted-foreground">Session</div>
              <div className="font-medium">{session?.access_token ? "OK" : "Missing"}</div>

              <div className="text-muted-foreground">isAdmin</div>
              <div className="font-medium">{isAdminLoading ? "Checking…" : isAdmin ? "Yes" : "No"}</div>

              <div className="text-muted-foreground">Entitlement</div>
              <div className="font-medium">
                {entitlementLoading ? "Checking…" : hasEntitlement ? "Yes" : "No"}
              </div>

              <div className="text-muted-foreground">isPurchased</div>
              <div className="font-medium">{isPurchased ? "Yes" : "No"}</div>

              <div className="text-muted-foreground">Purchase check</div>
              <div className="font-medium">{isCheckingPurchase ? "Checking…" : "Done"}</div>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground">Last purchase check: {formatTime(lastPurchaseCheckAt)}</div>
              <div className="text-xs text-muted-foreground">Last admin check: {formatTime(adminCheckedAt)}</div>
              <div className="text-xs text-muted-foreground">Last entitlement check: {formatTime(entitlementCheckedAt)}</div>

              {(adminError || entitlementError) && (
                <div className="text-xs text-destructive">
                  {adminError ? `Admin check: ${adminError}` : null}
                  {adminError && entitlementError ? " · " : null}
                  {entitlementError ? `Entitlement check: ${entitlementError}` : null}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 bg-background/90 backdrop-blur-sm shadow-card"
        >
          <Shield className="h-4 w-4" />
          Owner Diagnostics
        </Button>
      )}
    </div>
  );
};

export default OwnerDiagnosticsPanel;
