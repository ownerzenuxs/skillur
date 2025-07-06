
-- Update the foreign key constraint to cascade deletes
ALTER TABLE public.referrals 
DROP CONSTRAINT IF EXISTS referrals_referred_id_fkey;

ALTER TABLE public.referrals 
DROP CONSTRAINT IF EXISTS referrals_referrer_id_fkey;

-- Re-add the foreign key constraints with CASCADE delete behavior
ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referred_id_fkey 
FOREIGN KEY (referred_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT referrals_referrer_id_fkey 
FOREIGN KEY (referrer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
