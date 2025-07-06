
-- First, drop existing problematic RLS policies on profiles table
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a security definer function to get current user role (prevents recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Create a security definer function to check if user is admin (prevents recursion)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) FROM public.profiles WHERE id = auth.uid();
$$;

-- Recreate RLS policies using the security definer functions
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_user_admin() = true);

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (public.is_user_admin() = true);

-- Update other tables that reference profiles to use the security definer function
DROP POLICY IF EXISTS "Admins can manage cards" ON public.cards;
DROP POLICY IF EXISTS "Admins can manage chapters" ON public.chapters;
DROP POLICY IF EXISTS "Admins can manage subjects" ON public.subjects;
DROP POLICY IF EXISTS "Admins can view all progress" ON public.user_progress;

-- Recreate admin policies for other tables using security definer function
CREATE POLICY "Admins can manage cards"
  ON public.cards
  FOR ALL
  USING (public.is_user_admin() = true);

CREATE POLICY "Admins can manage chapters"
  ON public.chapters
  FOR ALL
  USING (public.is_user_admin() = true);

CREATE POLICY "Admins can manage subjects"
  ON public.subjects
  FOR ALL
  USING (public.is_user_admin() = true);

CREATE POLICY "Admins can view all progress"
  ON public.user_progress
  FOR SELECT
  USING (public.is_user_admin() = true);

-- Ensure all RLS policies are properly enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
