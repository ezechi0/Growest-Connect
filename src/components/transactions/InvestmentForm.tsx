import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { DollarSign, CreditCard, Smartphone, Shield } from 'lucide-react';

interface InvestmentFormProps {
  projectId: string;
  projectTitle: string;
  minInvestment: number;
  maxInvestment?: number;
  onSuccess?: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({
  projectId,
  projectTitle,
  minInvestment,
  maxInvestment,
  onSuccess
}) => {
  const { user } = useUserRole();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: minInvestment,
    currency: 'XOF',
    useMobileMoney: false,
    agreeTerms: false
  });

  const currencies = [
    { value: 'XOF', label: 'XOF (Franc CFA)', flag: '🇨🇮' },
    { value: 'EUR', label: 'EUR (Euro)', flag: '🇪🇺' },
    { value: 'USD', label: 'USD (Dollar)', flag: '🇺🇸' },
    { value: 'NGN', label: 'NGN (Naira)', flag: '🇳🇬' }
  ];

  const handleInvest = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour investir",
        variant: "destructive"
      });
      return;
    }

    if (!formData.agreeTerms) {
      toast({
        title: "Conditions requises",
        description: "Veuillez accepter les conditions d'investissement",
        variant: "destructive"
      });
      return;
    }

    if (formData.amount < minInvestment) {
      toast({
        title: "Montant insuffisant",
        description: `Le montant minimum d'investissement est de ${minInvestment} ${formData.currency}`,
        variant: "destructive"
      });
      return;
    }

    if (maxInvestment && formData.amount > maxInvestment) {
      toast({
        title: "Montant trop élevé",
        description: `Le montant maximum d'investissement est de ${maxInvestment} ${formData.currency}`,
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Obtenir l'email de l'utilisateur
      // SECURITY: Selecting own profile data only
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      const { data, error } = await supabase.functions.invoke('paystack-payment', {
        body: {
          action: 'initialize_payment',
          amount: formData.amount,
          currency: formData.currency,
          email: user.email || '',
          project_id: projectId,
          investor_id: user.id,
          transaction_type: 'investment',
          mobile_money: formData.useMobileMoney
        }
      });

      if (error) throw error;

      if (data.success) {
        // Rediriger vers Paystack
        window.location.href = data.authorization_url;
      } else {
        throw new Error(data.error || 'Échec de l\'initialisation du paiement');
      }
    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: "Erreur d'investissement",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCommission = () => {
    return Math.round(formData.amount * 0.05 * 100) / 100;
  };

  const selectedCurrency = currencies.find(c => c.value === formData.currency);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Investir dans ce projet
        </CardTitle>
        <CardDescription>
          Projet: {projectTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Montant d'investissement</Label>
          <Input
            id="amount"
            type="number"
            min={minInvestment}
            max={maxInvestment}
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
            placeholder={`Minimum: ${minInvestment}`}
          />
          <p className="text-xs text-muted-foreground">
            Minimum: {minInvestment.toLocaleString()} {formData.currency}
            {maxInvestment && ` - Maximum: ${maxInvestment.toLocaleString()} ${formData.currency}`}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.value} value={currency.value}>
                  <span className="flex items-center gap-2">
                    <span>{currency.flag}</span>
                    <span>{currency.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="mobileMoney"
            checked={formData.useMobileMoney}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, useMobileMoney: checked as boolean }))}
          />
          <Label htmlFor="mobileMoney" className="flex items-center gap-2 text-sm">
            <Smartphone className="w-4 h-4" />
            Activer Mobile Money
          </Label>
        </div>

        <div className="bg-muted p-3 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Montant d'investissement:</span>
            <span>{formData.amount.toLocaleString()} {formData.currency}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Commission plateforme (5%):</span>
            <span>{calculateCommission().toLocaleString()} {formData.currency}</span>
          </div>
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Total à payer:</span>
            <span>{formData.amount.toLocaleString()} {formData.currency}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreeTerms: checked as boolean }))}
          />
          <Label htmlFor="terms" className="text-xs">
            J'accepte les <span className="underline cursor-pointer">conditions d'investissement</span> et je comprends les risques associés
          </Label>
        </div>

        <Button 
          onClick={handleInvest}
          disabled={loading || !formData.agreeTerms}
          className="w-full"
        >
          {loading ? (
            "Initialisation..."
          ) : (
            <span className="flex items-center gap-2">
              {formData.useMobileMoney ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Investir {formData.amount.toLocaleString()} {formData.currency}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-3 h-3" />
          <span>Paiement sécurisé par Paystack</span>
        </div>
      </CardContent>
    </Card>
  );
};