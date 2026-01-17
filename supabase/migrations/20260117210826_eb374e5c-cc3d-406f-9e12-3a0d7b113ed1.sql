-- Fix profiles table UPDATE policy to prevent user_id manipulation
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix children table UPDATE policy to prevent parent_id manipulation  
DROP POLICY IF EXISTS "Parents can update their children" ON public.children;
CREATE POLICY "Parents can update their children" 
ON public.children 
FOR UPDATE 
USING (auth.uid() = parent_id)
WITH CHECK (auth.uid() = parent_id);