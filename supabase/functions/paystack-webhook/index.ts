import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
};

interface PaystackEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: any;
    customer: {
      email: string;
    };
  };
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

    const signature = req.headers.get('x-paystack-signature');
    const body = await req.text();
    
    // Verify webhook signature
    const hash = await crypto.subtle.digest(
      'SHA-512',
      new TextEncoder().encode(Deno.env.get('PAYSTACK_SECRET_KEY') + body)
    );
    const expectedSignature = Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    const event: PaystackEvent = JSON.parse(body);
    console.log('Paystack webhook event:', event);

    if (event.event === 'charge.success') {
      // Update transaction status
      const { error: updateError } = await supabaseClient
        .from('transactions')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('paystack_reference', event.data.reference);

      if (updateError) {
        console.error('Transaction update error:', updateError);
      }

      // If it's a project investment, update project funding
      if (event.data.metadata?.projectId && event.data.metadata?.plan_type === 'investment') {
        const { data: project } = await supabaseClient
          .from('projects')
          .select('current_funding')
          .eq('id', event.data.metadata.projectId)
          .single();

        if (project) {
          const newFunding = (project.current_funding || 0) + (event.data.amount / 100);
          await supabaseClient
            .from('projects')
            .update({ current_funding: newFunding })
            .eq('id', event.data.metadata.projectId);
        }
      }

      console.log('Payment processed successfully:', event.data.reference);
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in paystack-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);