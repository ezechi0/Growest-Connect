import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const paystackSecretKey = Deno.env.get('PAYSTACK_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!paystackSecretKey) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { action, ...payload } = await req.json();

    console.log('Paystack payment action:', action, payload);

    switch (action) {
      case 'initialize_payment': {
        const { amount, email, project_id, investor_id, transaction_type = 'investment' } = payload;

        // Initialize payment with Paystack
        const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount * 100, // Paystack expects amount in kobo (cents)
            email,
            currency: 'NGN',
            callback_url: `${req.headers.get('origin')}/payment-success`,
            metadata: {
              project_id,
              investor_id,
              transaction_type,
            },
          }),
        });

        const paystackData = await paystackResponse.json();
        
        if (!paystackData.status) {
          throw new Error(paystackData.message || 'Payment initialization failed');
        }

        // Store transaction in database
        const { error: dbError } = await supabase
          .from('transactions')
          .insert({
            amount,
            investor_id,
            project_id,
            transaction_type,
            status: 'pending',
            payment_method: 'paystack',
            paystack_reference: paystackData.data.reference,
          });

        if (dbError) {
          console.error('Database error:', dbError);
          throw new Error('Failed to store transaction');
        }

        return new Response(JSON.stringify({
          success: true,
          authorization_url: paystackData.data.authorization_url,
          reference: paystackData.data.reference,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'verify_payment': {
        const { reference } = payload;

        // Verify payment with Paystack
        const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
          },
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyData.status || verifyData.data.status !== 'success') {
          throw new Error('Payment verification failed');
        }

        // Update transaction status
        const { data: transaction, error: updateError } = await supabase
          .from('transactions')
          .update({ status: 'completed' })
          .eq('paystack_reference', reference)
          .select()
          .single();

        if (updateError) {
          console.error('Transaction update error:', updateError);
          throw new Error('Failed to update transaction');
        }

        // Update project funding if it's an investment
        if (transaction.transaction_type === 'investment') {
          const { error: projectError } = await supabase
            .from('projects')
            .update({
              current_funding: `current_funding + ${transaction.amount}`,
            })
            .eq('id', transaction.project_id);

          if (projectError) {
            console.error('Project update error:', projectError);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          transaction,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'create_subscription': {
        const { plan_code, customer_code, amount } = payload;

        const subscriptionResponse = await fetch('https://api.paystack.co/subscription', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: customer_code,
            plan: plan_code,
            authorization: payload.authorization,
          }),
        });

        const subscriptionData = await subscriptionResponse.json();

        return new Response(JSON.stringify(subscriptionData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Paystack payment error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});