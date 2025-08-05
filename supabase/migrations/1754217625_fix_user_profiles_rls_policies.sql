-- Migration: fix_user_profiles_rls_policies
-- Created at: 1754217625

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;

-- Allow users to insert their own profile (where id = auth.uid())
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.user_profiles
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = id);

-- Allow everyone to read all profiles
CREATE POLICY "Anyone can view profiles" ON public.user_profiles
  FOR SELECT 
  TO public
  USING (true);;