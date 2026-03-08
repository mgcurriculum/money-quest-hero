
-- Add campaign_code column
ALTER TABLE public.campaigns ADD COLUMN campaign_code text;

-- Backfill existing campaigns with unique 5-char codes
UPDATE public.campaigns SET campaign_code = upper(substr(md5(random()::text), 1, 5));

-- Make it NOT NULL and UNIQUE
ALTER TABLE public.campaigns ALTER COLUMN campaign_code SET NOT NULL;
ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_campaign_code_key UNIQUE (campaign_code);

-- Trigger function to auto-generate campaign_code on insert if not provided
CREATE OR REPLACE FUNCTION public.generate_campaign_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.campaign_code IS NULL OR NEW.campaign_code = '' THEN
    LOOP
      NEW.campaign_code := upper(substr(md5(random()::text), 1, 5));
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.campaigns WHERE campaign_code = NEW.campaign_code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_campaign_code
  BEFORE INSERT ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_campaign_code();
