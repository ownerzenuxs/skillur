-- Drop existing class-based policies that might be causing issues
DROP POLICY IF EXISTS "Users can view subjects for their class" ON public.subjects;
DROP POLICY IF EXISTS "Users can view chapters for their class" ON public.chapters;
DROP POLICY IF EXISTS "Users can view cards for their class" ON public.cards;

-- Create more robust RLS policies for class-based filtering
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

-- Ensure all existing data has a default class value
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