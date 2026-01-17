import { z } from "zod";

// Auth validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be less than 128 characters");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters")
  .regex(/^[a-zA-Z0-9\s\-']+$/, "Name can only contain letters, numbers, spaces, hyphens, and apostrophes");

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

// Child validation schemas
export const childNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(50, "Name must be less than 50 characters")
  .regex(/^[a-zA-Z0-9\s\-']+$/, "Name can only contain letters, numbers, spaces, hyphens, and apostrophes");

export const birthYearSchema = z
  .number()
  .int("Birth year must be a whole number")
  .min(2000, "Birth year must be 2000 or later")
  .max(new Date().getFullYear(), "Birth year cannot be in the future")
  .optional();

export const avatarEmojiSchema = z
  .string()
  .min(1, "Avatar is required")
  .max(10, "Invalid avatar");

export const addChildSchema = z.object({
  name: childNameSchema,
  avatarEmoji: avatarEmojiSchema,
  birthYear: birthYearSchema,
});

// Quest validation schemas
export const questIdSchema = z
  .string()
  .trim()
  .min(1, "Quest ID is required")
  .max(100, "Quest ID is too long");

export const xpEarnedSchema = z
  .number()
  .int("XP must be a whole number")
  .min(1, "XP must be at least 1")
  .max(1000, "XP cannot exceed 1000");

export const completeQuestSchema = z.object({
  questId: questIdSchema,
  xpEarned: xpEarnedSchema.optional().default(10),
});

// Badge validation schema
export const badgeSchema = z.object({
  name: z.string().trim().min(1, "Badge name is required").max(100, "Badge name must be less than 100 characters"),
  description: z.string().trim().min(1, "Description is required").max(500, "Description must be less than 500 characters"),
  emoji: z.string().min(1, "Emoji is required").max(10, "Invalid emoji"),
  xp_required: z.number().int().min(0, "XP required must be non-negative"),
  quest_count_required: z.number().int().min(0, "Quest count required must be non-negative"),
});

// Validation result types
export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationError = { success: false; error: string };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationError;

// Validation helper function
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const firstError = result.error.errors[0];
  return { success: false, error: firstError?.message || "Validation failed" };
}
