import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  email: string;
  amount: number;
  plan: string;
  projectId?: string;
  metadata?: any;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { email, amount, plan, projectId, metadata }: PaymentRequest = await req.json();
    console.log('Payment request:', { email, amount, plan, projectId });

    // Initialize payment with Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack expects amount in kobo (smallest currency unit)
        plan,
        metadata: {
          ...metadata,
          projectId,
          plan_type: plan,
        },
      }),
    });

    const paystackData: PaystackResponse = await paystackResponse.json();
    console.log('Paystack response:', paystackData);

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed');
    }

    // Store transaction in database
    if (projectId) {
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          investor_id: metadata.userId,
          project_id: projectId,
          amount: amount,
          transaction_type: plan === 'premium' ? 'subscription' : 'investment',
          payment_method: 'paystack',
          paystack_reference: paystackData.data.reference,
          status: 'pending',
          notes: `Payment for ${plan} plan`,
        });

      if (transactionError) {
        console.error('Transaction storage error:', transactionError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: paystackData.data,
        reference: paystackData.data.reference,
        authorization_url: paystackData.data.authorization_url,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in paystack-payment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);