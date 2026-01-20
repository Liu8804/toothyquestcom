export const PRODUCT_ID = "prod_ToloozqRZM4fpp";
export const ANNUAL_PRODUCT_ID = "prod_ToloWHHcJ4wnOm";

export const FREE_QUEST_LIMIT = 5;
export const QUESTS_REQUIRED_FOR_GAMES = 5;

// Test mode - set to true to unlock all content for testing
export const TEST_MODE_UNLOCK_ALL = false;

// Pricing configuration
export const PRICING = {
  monthly: {
    price: 4.99,
    priceId: "price_1Sr8GsLk8GbX7sRHrXxv3rwu",
    label: "$4.99",
    period: "one-time",
  },
  annual: {
    price: 49.99,
    priceId: "price_1Sr8HELk8GbX7sRHab1rRdNJ",
    label: "$49.99",
    period: "one-time",
    savings: "16%",
  },
  legacy: {
    price: 3.99,
    priceId: "price_1SqsbxLk8GbX7sRHlqnZHOuD",
    label: "$3.99",
    period: "one-time",
  },
} as const;

interface PurchaseMessages {
  purchaseSuccess: string;
  restoreSuccess: string;
  lockedContent: string;
}

export const purchaseMessages: PurchaseMessages = {
  purchaseSuccess: "Welcome to the full ToothyQuest adventure!",
  restoreSuccess: "Your previous purchase has been restored. Enjoy all quests!",
  lockedContent: "Complete the first 5 quests or unlock the full adventure to play this quest!",
};

export type PlanType = "monthly" | "annual";
