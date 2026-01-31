import { supabase } from "@/integrations/supabase/client";

/**
 * Returns an auth token suitable for calling backend functions.
 * - Signed-in users: session access token
 * - Guests: publishable key (treated as anonymous)
 */
export const getFunctionsAuthToken = async (): Promise<string> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
};

export const buildFunctionsHeaders = async (): Promise<Record<string, string>> => {
  const token = await getFunctionsAuthToken();
  return {
    "Content-Type": "application/json",
    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${token}`,
  };
};
