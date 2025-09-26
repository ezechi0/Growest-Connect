-- Fix security warnings by setting search_path for existing functions

-- Fix generate_receipt_number function
CREATE OR REPLACE FUNCTION public.generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'REC-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(epoch FROM now())::text, 10, '0');
END;
$function$;

-- Fix auto_generate_receipt_number trigger function
CREATE OR REPLACE FUNCTION public.auto_generate_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number = generate_receipt_number();
    NEW.net_amount = NEW.amount - COALESCE(NEW.commission_amount, 0);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix calculate_commission function
CREATE OR REPLACE FUNCTION public.calculate_commission(amount numeric, commission_rate numeric DEFAULT 0.05)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN ROUND(amount * commission_rate, 2);
END;
$function$;