-- Add explicit DELETE policy to user_streaks table to block all deletes
-- Streak history should be preserved for integrity and analytics
CREATE POLICY "Block user streak deletes" 
ON public.user_streaks 
FOR DELETE 
USING (false);