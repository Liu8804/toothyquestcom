// NOTE: this file is intentionally kept small now.
// The actual shared purchase state is implemented via a provider,
// so PurchaseModal, GamesModal, and the rest of the app stay in sync.

export * from "@/hooks/purchase/constants";
export { PurchaseProvider } from "@/hooks/purchase/PurchaseProvider";
import { usePurchaseContext } from "@/hooks/purchase/PurchaseProvider";

export const usePurchase = () => usePurchaseContext();
