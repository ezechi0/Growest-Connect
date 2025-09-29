-- Create function to increment project funding
CREATE OR REPLACE FUNCTION public.increment_project_funding(project_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.projects 
  SET current_funding = current_funding + amount
  WHERE id = project_id;
END;
$function$;

-- Create function to handle payment verification and subscription management
CREATE OR REPLACE FUNCTION public.handle_payment_verification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- When a transaction is completed, update project funding if it's an investment
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.transaction_type = 'investment' THEN
    -- Update project funding
    UPDATE public.projects 
    SET current_funding = current_funding + NEW.amount
    WHERE id = NEW.project_id;
    
    -- Create payout record for entrepreneur
    INSERT INTO public.payouts (
      entrepreneur_id,
      project_id,
      amount,
      currency,
      status,
      notes
    )
    SELECT 
      p.owner_id,
      NEW.project_id,
      NEW.amount - COALESCE(NEW.commission_amount, 0),
      NEW.currency,
      'pending',
      'Payout automatique pour investissement ' || NEW.paystack_reference
    FROM public.projects p
    WHERE p.id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for automatic payment processing
DROP TRIGGER IF EXISTS handle_payment_verification_trigger ON public.transactions;
CREATE TRIGGER handle_payment_verification_trigger
    AFTER UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_payment_verification();

-- Ensure all premium badge related data is consistent
UPDATE public.profiles 
SET role = 'entrepreneur' 
WHERE role IS NULL AND user_type = 'entrepreneur';

UPDATE public.profiles 
SET role = 'investor' 
WHERE role IS NULL AND user_type = 'investor';

-- Create index for better performance on subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);