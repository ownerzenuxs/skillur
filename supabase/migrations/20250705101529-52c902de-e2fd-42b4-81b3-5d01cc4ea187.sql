
-- Add coin_price column to chapters table
ALTER TABLE public.chapters 
ADD COLUMN coin_price INTEGER DEFAULT NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.chapters.coin_price IS 'Optional coin price to unlock chapter. NULL means free access.';
