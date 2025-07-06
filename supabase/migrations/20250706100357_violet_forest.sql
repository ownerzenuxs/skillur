/*
  # Add class support to database schema

  1. Schema Changes
    - Add `class` column to profiles table
    - Add `class` column to subjects table  
    - Add `class` column to chapters table
    - Add `class` column to cards table

  2. Security
    - Update RLS policies to respect class filtering
    - Ensure users only see content for their class

  3. Data Migration
    - Set default class values for existing data
*/

-- Add class column to profiles table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN class TEXT DEFAULT '6';
  END IF;
END $$;

-- Add class column to subjects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subjects' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.subjects ADD COLUMN class TEXT DEFAULT '6';
  END IF;
END $$;

-- Add class column to chapters table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chapters' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.chapters ADD COLUMN class TEXT DEFAULT '6';
  END IF;
END $$;

-- Add class column to cards table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cards' AND column_name = 'class'
  ) THEN
    ALTER TABLE public.cards ADD COLUMN class TEXT DEFAULT '6';
  END IF;
END $$;

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

-- Add RLS policies for class-based filtering
CREATE POLICY "Users can view subjects for their class"
  ON public.subjects
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    class = (SELECT class FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view chapters for their class"
  ON public.chapters
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    class = (SELECT class FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can view cards for their class"
  ON public.cards
  FOR SELECT
  USING (
    public.is_user_admin() = true OR 
    class = (SELECT class FROM public.profiles WHERE id = auth.uid())
  );

-- Add comments to explain the class columns
COMMENT ON COLUMN public.profiles.class IS 'Student class level (6-10)';
COMMENT ON COLUMN public.subjects.class IS 'Class level for this subject (6-10)';
COMMENT ON COLUMN public.chapters.class IS 'Class level for this chapter (6-10)';
COMMENT ON COLUMN public.cards.class IS 'Class level for this card (6-10)';