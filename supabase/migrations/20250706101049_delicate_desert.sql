-- Add class column to all tables if they don't exist
DO $$
BEGIN
  -- Add class column to profiles table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN class TEXT DEFAULT '6';
  END IF;

  -- Add class column to subjects table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.subjects ADD COLUMN class TEXT DEFAULT '6';
  END IF;

  -- Add class column to chapters table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN class TEXT DEFAULT '6';
  END IF;

  -- Add class column to cards table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.cards ADD COLUMN class TEXT DEFAULT '6';
  END IF;
END $$;

-- Update all existing data to have default class value
UPDATE public.subjects SET class = '6' WHERE class IS NULL;
UPDATE public.chapters SET class = '6' WHERE class IS NULL;
UPDATE public.cards SET class = '6' WHERE class IS NULL;
UPDATE public.profiles SET class = '6' WHERE class IS NULL;

-- Make class columns NOT NULL with default values
ALTER TABLE public.subjects ALTER COLUMN class SET NOT NULL;
ALTER TABLE public.subjects ALTER COLUMN class SET DEFAULT '6';

ALTER TABLE public.chapters ALTER COLUMN class SET NOT NULL;
ALTER TABLE public.chapters ALTER COLUMN class SET DEFAULT '6';

ALTER TABLE public.cards ALTER COLUMN class SET NOT NULL;
ALTER TABLE public.cards ALTER COLUMN class SET DEFAULT '6';

ALTER TABLE public.profiles ALTER COLUMN class SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN class SET DEFAULT '6';

-- Update the handle_new_user function to include class
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, scs_number, phone_number, role, coins, is_admin, class)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'scs_number',
    NEW.raw_user_meta_data ->> 'phone_number',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    0,
    COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, false),
    COALESCE(NEW.raw_user_meta_data ->> 'class', '6')
  );
  RETURN NEW;
END;
$$;

-- Drop existing class-based policies that might be causing issues
DROP POLICY IF EXISTS "Users can view subjects for their class" ON public.subjects;
DROP POLICY IF EXISTS "Users can view chapters for their class" ON public.chapters;
DROP POLICY IF EXISTS "Users can view cards for their class" ON public.cards;

-- Create robust RLS policies for class-based filtering
CREATE POLICY "Users can view subjects for their class"
  ON public.subjects
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    (class IS NOT NULL AND class = (SELECT class FROM public.profiles WHERE id = auth.uid())) OR
    (class IS NULL)
  );

CREATE POLICY "Users can view chapters for their class"
  ON public.chapters
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    (class IS NOT NULL AND class = (SELECT class FROM public.profiles WHERE id = auth.uid())) OR
    (class IS NULL)
  );

CREATE POLICY "Users can view cards for their class"
  ON public.cards
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    (class IS NOT NULL AND class = (SELECT class FROM public.profiles WHERE id = auth.uid())) OR
    (class IS NULL)
  );

-- Add comments to explain the class columns
COMMENT ON COLUMN public.profiles.class IS 'Student class level (6-10)';
COMMENT ON COLUMN public.subjects.class IS 'Class level for this subject (6-10)';
COMMENT ON COLUMN public.chapters.class IS 'Class level for this chapter (6-10)';
COMMENT ON COLUMN public.cards.class IS 'Class level for this card (6-10)';