-- Update the make_user_admin function to be more robust
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
  
  -- If no rows were updated, the user doesn't exist yet
  IF NOT FOUND THEN
    RAISE NOTICE 'User with email % not found. Please ensure they have signed up first.', user_email;
  ELSE
    RAISE NOTICE 'User % has been made an admin successfully.', user_email;
  END IF;
END;
$$;

-- Create a function to check if any admins exist
CREATE OR REPLACE FUNCTION public.has_any_admins()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE role = 'admin'
  );
$$;

-- Improve the RLS policies to avoid recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all games" ON public.games;

-- Create a security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Recreate policies using the security definer function
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage all games" 
ON public.games 
FOR ALL 
USING (public.get_current_user_role() = 'admin');