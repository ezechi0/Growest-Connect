-- Améliorer la table transactions pour supporter plus de devises et métadonnées
ALTER TABLE public.transactions 
ADD COLUMN currency text DEFAULT 'XOF',
ADD COLUMN receipt_url text,
ADD COLUMN receipt_number text UNIQUE,
ADD COLUMN payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processed', 'failed')),
ADD COLUMN payout_reference text,
ADD COLUMN payout_date timestamp with time zone,
ADD COLUMN commission_amount numeric DEFAULT 0,
ADD COLUMN net_amount numeric;

-- Créer une fonction pour générer des numéros de reçu
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'REC-' || to_char(now(), 'YYYYMMDD') || '-' || LPAD(EXTRACT(epoch FROM now())::text, 10, '0');
END;
$$;

-- Trigger pour générer automatiquement le numéro de reçu
CREATE OR REPLACE FUNCTION auto_generate_receipt_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' AND NEW.receipt_number IS NULL THEN
    NEW.receipt_number = generate_receipt_number();
    NEW.net_amount = NEW.amount - COALESCE(NEW.commission_amount, 0);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_receipt_number
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_receipt_number();

-- Créer une table pour les taux de change (pour supporter plusieurs devises)
CREATE TABLE public.exchange_rates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Insérer quelques taux de base (XOF est la devise de base)
INSERT INTO public.exchange_rates (from_currency, to_currency, rate) VALUES
('XOF', 'EUR', 0.0015),
('XOF', 'USD', 0.0016),
('EUR', 'XOF', 656.0),
('USD', 'XOF', 615.0),
('NGN', 'XOF', 1.3),
('XOF', 'NGN', 0.77);

-- Activer RLS sur la table exchange_rates
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Politique pour que tout le monde puisse voir les taux de change
CREATE POLICY "Taux de change publics" 
ON public.exchange_rates 
FOR SELECT 
USING (true);

-- Créer une table pour les payouts (versements aux entrepreneurs)
CREATE TABLE public.payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  entrepreneur_id uuid NOT NULL,
  project_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'XOF',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payout_method text DEFAULT 'bank_transfer',
  payout_reference text,
  bank_details jsonb,
  notes text,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur la table payouts
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour payouts
CREATE POLICY "Entrepreneurs voient leurs payouts" 
ON public.payouts 
FOR SELECT 
USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Admins voient tous les payouts" 
ON public.payouts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

-- Trigger pour updated_at sur payouts
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Améliorer les politiques RLS des transactions pour permettre les mises à jour par le système
CREATE POLICY "Système peut mettre à jour les transactions" 
ON public.transactions 
FOR UPDATE 
USING (true);

-- Fonction pour calculer les commissions (5% par défaut)
CREATE OR REPLACE FUNCTION calculate_commission(amount numeric, commission_rate numeric DEFAULT 0.05)
RETURNS numeric
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN ROUND(amount * commission_rate, 2);
END;
$$;