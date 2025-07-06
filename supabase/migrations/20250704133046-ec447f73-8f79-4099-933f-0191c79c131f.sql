
-- Update the profiles table to support the new authentication system
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;
ALTER TABLE public.profiles ADD COLUMN scs_number TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.profiles ADD COLUMN referral_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Set default coins to 0 for new signups (no coins on signup)
ALTER TABLE public.profiles ALTER COLUMN coins SET DEFAULT 0;

-- Create premium plans table
CREATE TABLE public.premium_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  coins_per_month INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default premium plans
INSERT INTO public.premium_plans (name, price, coins_per_month) VALUES
('Basic Plan', 99.00, 50),
('Standard Plan', 199.00, 120),
('Premium Plan', 299.00, 200);

-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES public.profiles(id) NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) NOT NULL,
  coins_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on new tables
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS policies for premium_plans (public read access)
CREATE POLICY "Anyone can view premium plans" 
  ON public.premium_plans 
  FOR SELECT 
  USING (true);

-- RLS policies for referrals
CREATE POLICY "Users can view their own referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals" 
  ON public.referrals 
  FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

-- Update the trigger function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, scs_number, phone_number, role, coins, is_admin)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'scs_number',
    NEW.raw_user_meta_data ->> 'phone_number',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
    0, -- No coins on signup
    COALESCE((NEW.raw_user_meta_data ->> 'is_admin')::boolean, false)
  );
  RETURN NEW;
END;
$$;

-- Create function to handle referral system
CREATE OR REPLACE FUNCTION public.handle_referral(referrer_scs TEXT, new_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  referrer_id UUID;
  referrer_count INTEGER;
BEGIN
  -- Find the referrer by SCS number
  SELECT id, referral_count INTO referrer_id, referrer_count
  FROM public.profiles 
  WHERE scs_number = referrer_scs;
  
  IF referrer_id IS NOT NULL THEN
    -- Update the new user's referred_by field
    UPDATE public.profiles 
    SET referred_by = referrer_id 
    WHERE id = new_user_id;
    
    -- Insert referral record
    INSERT INTO public.referrals (referrer_id, referred_id)
    VALUES (referrer_id, new_user_id);
    
    -- Update referrer's count
    UPDATE public.profiles 
    SET referral_count = referral_count + 1
    WHERE id = referrer_id;
    
    -- Award coins if referrer has referred 2 or more users
    IF (referrer_count + 1) % 2 = 0 THEN
      UPDATE public.profiles 
      SET coins = coins + 1 
      WHERE id = referrer_id;
    END IF;
  END IF;
END;
$$;
