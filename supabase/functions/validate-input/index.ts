import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schemas
const validators = {
  // Email validation
  email: (value: string): { valid: boolean; error?: string } => {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: 'Email is required' };
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Email cannot be empty' };
    }
    if (trimmed.length > 255) {
      return { valid: false, error: 'Email must be less than 255 characters' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Invalid email format' };
    }
    return { valid: true };
  },

  // Display name validation
  displayName: (value: string): { valid: boolean; error?: string } => {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: 'Display name is required' };
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Display name cannot be empty' };
    }
    if (trimmed.length > 100) {
      return { valid: false, error: 'Display name must be less than 100 characters' };
    }
    const nameRegex = /^[a-zA-Z0-9\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return { valid: false, error: 'Display name can only contain letters, numbers, spaces, hyphens, and apostrophes' };
    }
    return { valid: true };
  },

  // Child name validation
  childName: (value: string): { valid: boolean; error?: string } => {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: 'Child name is required' };
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Child name cannot be empty' };
    }
    if (trimmed.length > 50) {
      return { valid: false, error: 'Child name must be less than 50 characters' };
    }
    const nameRegex = /^[a-zA-Z0-9\s\-']+$/;
    if (!nameRegex.test(trimmed)) {
      return { valid: false, error: 'Child name can only contain letters, numbers, spaces, hyphens, and apostrophes' };
    }
    return { valid: true };
  },

  // Birth year validation
  birthYear: (value: number | undefined): { valid: boolean; error?: string } => {
    if (value === undefined || value === null) {
      return { valid: true }; // Optional field
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return { valid: false, error: 'Birth year must be a whole number' };
    }
    const currentYear = new Date().getFullYear();
    if (value < 2000) {
      return { valid: false, error: 'Birth year must be 2000 or later' };
    }
    if (value > currentYear) {
      return { valid: false, error: 'Birth year cannot be in the future' };
    }
    return { valid: true };
  },

  // Quest ID validation
  questId: (value: string): { valid: boolean; error?: string } => {
    if (!value || typeof value !== 'string') {
      return { valid: false, error: 'Quest ID is required' };
    }
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return { valid: false, error: 'Quest ID cannot be empty' };
    }
    if (trimmed.length > 100) {
      return { valid: false, error: 'Quest ID is too long' };
    }
    return { valid: true };
  },

  // XP earned validation
  xpEarned: (value: number): { valid: boolean; error?: string } => {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      return { valid: false, error: 'XP must be a whole number' };
    }
    if (value < 1) {
      return { valid: false, error: 'XP must be at least 1' };
    }
    if (value > 1000) {
      return { valid: false, error: 'XP cannot exceed 1000' };
    }
    return { valid: true };
  },

  // Badge validation
  badge: (data: { name: string; description: string; emoji: string; xp_required: number; quest_count_required: number }): { valid: boolean; error?: string } => {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return { valid: false, error: 'Badge name is required' };
    }
    if (data.name.length > 100) {
      return { valid: false, error: 'Badge name must be less than 100 characters' };
    }
    if (!data.description || typeof data.description !== 'string') {
      return { valid: false, error: 'Badge description is required' };
    }
    if (data.description.length > 500) {
      return { valid: false, error: 'Badge description must be less than 500 characters' };
    }
    if (!data.emoji || typeof data.emoji !== 'string') {
      return { valid: false, error: 'Badge emoji is required' };
    }
    if (typeof data.xp_required !== 'number' || data.xp_required < 0) {
      return { valid: false, error: 'XP required must be a non-negative number' };
    }
    if (typeof data.quest_count_required !== 'number' || data.quest_count_required < 0) {
      return { valid: false, error: 'Quest count required must be a non-negative number' };
    }
    return { valid: true };
  },
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, data } = await req.json();
    console.log(`Validating action: ${action} for user: ${user.id}`);

    let validationResult: { valid: boolean; error?: string; sanitized?: unknown };

    switch (action) {
      case 'validateEmail':
        validationResult = validators.email(data.email);
        if (validationResult.valid) {
          validationResult.sanitized = data.email.trim().toLowerCase();
        }
        break;

      case 'validateDisplayName':
        validationResult = validators.displayName(data.displayName);
        if (validationResult.valid) {
          validationResult.sanitized = data.displayName.trim();
        }
        break;

      case 'validateChild':
        const nameResult = validators.childName(data.name);
        if (!nameResult.valid) {
          validationResult = nameResult;
          break;
        }
        const yearResult = validators.birthYear(data.birthYear);
        if (!yearResult.valid) {
          validationResult = yearResult;
          break;
        }
        validationResult = { 
          valid: true, 
          sanitized: { 
            name: data.name.trim(), 
            birthYear: data.birthYear,
            avatarEmoji: data.avatarEmoji || '🦷'
          } 
        };
        break;

      case 'validateQuest':
        const questResult = validators.questId(data.questId);
        if (!questResult.valid) {
          validationResult = questResult;
          break;
        }
        const xpResult = validators.xpEarned(data.xpEarned || 10);
        if (!xpResult.valid) {
          validationResult = xpResult;
          break;
        }
        validationResult = { 
          valid: true, 
          sanitized: { 
            questId: data.questId.trim(), 
            xpEarned: data.xpEarned || 10 
          } 
        };
        break;

      case 'validateBadge':
        validationResult = validators.badge(data);
        if (validationResult.valid) {
          validationResult.sanitized = {
            name: data.name.trim(),
            description: data.description.trim(),
            emoji: data.emoji,
            xp_required: data.xp_required,
            quest_count_required: data.quest_count_required,
          };
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`Validation result for ${action}:`, validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Validation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
