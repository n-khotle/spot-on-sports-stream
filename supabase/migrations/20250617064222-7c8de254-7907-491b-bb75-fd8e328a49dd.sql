-- Insert a default admin user
-- Note: You'll need to create this user through the auth signup process first
-- This is just to update the role after signup

-- Create a function to make a user admin (for demonstration)
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = user_email;
END;
$$;