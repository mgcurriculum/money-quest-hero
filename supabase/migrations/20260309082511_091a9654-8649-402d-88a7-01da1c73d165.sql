
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS difficulty integer DEFAULT 2;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS branch_low integer DEFAULT NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS branch_mid integer DEFAULT NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS branch_high integer DEFAULT NULL;
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS dimension text DEFAULT NULL;
