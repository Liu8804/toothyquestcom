import { useMemo, useState } from "react";
import { RefreshCw, Shield, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePurchase } from "@/hooks/usePurchase";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import { useEntitlementStatus } from "@/hooks/useEntitlementStatus";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatTime = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

/**
 * Admin-only diagnostics panel (no sensitive data):
 * - isAdmin (server-validated)
 * - isPurchased
 * - entitlement present (boolean)
 * - last purchase-check timestamp
 */
const AdminDiagnosticsPanel = () => {
  const { user } = useAuth();
  const {
    isPurchased,
    isCheckingPurchase,
    lastPurchaseCheckAt,
    refreshPurchaseStatus,
    isContentLocked,
  } = usePurchase();

  const {
    isAdmin,
    isAdminLoading,
    adminError,
    adminCheckedAt,
    refreshAdminStatus,
  } = useAdminStatus();

  const {
    hasEntitlement,
    entitlementLoading,
    entitlementError,
    entitlementCheckedAt,
    refreshEntitlementStatus,
  } = useEntitlementStatus();

  const [open, setOpen] = useState(true);

  const canShow = !!user && (isAdmin || hasEntitlement);
  const userIdSuffix = useMemo(() => (user?.id ? user.id.slice(-6) : "—"), [user?.id]);
  const gamesLockedNow = useMemo(() => isContentLocked(0, "game", 0), [isContentLocked]);

  if (!canShow) return null;

  const handleRefresh = async () => {
    await Promise.all([refreshAdminStatus(), refreshEntitlementStatus()]);
    // purchase refresh is async internally; we timestamp the start here (the hook will also stamp completion)
    refreshPurchaseStatus();
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[min(420px,calc(100vw-2rem))]">
      {open ? (
        <Card className="shadow-card border-border/60 bg-background/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Admin Diagnostics
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
              <div className="text-muted-foreground">User</div>
              <div className="font-medium">…{userIdSuffix}</div>

              <div className="text-muted-foreground">isAdmin</div>
              <div className="font-medium">
                {isAdminLoading ? "Checking…" : isAdmin ? "Yes" : "No"}
              </div>

              <div className="text-muted-foreground">Entitlement</div>
              <div className="font-medium">
                {entitlementLoading ? "Checking…" : hasEntitlement ? "Yes" : "No"}
              </div>

              <div className="text-muted-foreground">isPurchased</div>
              <div className="font-medium">{isPurchased ? "Yes" : "No"}</div>

              <div className="text-muted-foreground">Purchase check</div>
              <div className="font-medium">{isCheckingPurchase ? "Checking…" : "Done"}</div>

              <div className="text-muted-foreground">Games locked?</div>
              <div className="font-medium">{gamesLockedNow ? "Yes" : "No"}</div>
            </div>

            <div className="pt-2 border-t border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground">
                Last purchase check: {formatTime(lastPurchaseCheckAt)}
              </div>
              <div className="text-xs text-muted-foreground">
                Last admin check: {formatTime(adminCheckedAt)}
                {adminError ? ` (error)` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                Last entitlement check: {formatTime(entitlementCheckedAt)}
                {entitlementError ? ` (error)` : ""}
              </div>

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
          Diagnostics
        </Button>
      )}
    </div>
  );
};

export default AdminDiagnosticsPanel;
