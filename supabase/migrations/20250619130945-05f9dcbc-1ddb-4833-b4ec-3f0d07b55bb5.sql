-- Add policy to allow admins to update any user profile
CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (get_current_user_role() = 'admin');

-- Add policy to allow admins to delete any user profile  
CREATE POLICY "Admins can delete all profiles" 
ON public.profiles 
FOR DELETE 
USING (get_current_user_role() = 'admin');