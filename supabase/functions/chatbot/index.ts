import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, context } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Chatbot request:', { message, context });

    const systemPrompt = `Tu es un assistant IA spécialisé dans la plateforme Growest Connect, une application qui met en relation les porteurs de projets et les investisseurs en Afrique et ailleurs.

Ton rôle:
- Aider les utilisateurs à naviguer sur la plateforme
- Répondre aux questions sur l'investissement et le financement de projets
- Donner des conseils sur la création de pitch decks
- Expliquer les fonctionnalités de la plateforme
- Assister dans le processus de mise en relation investisseurs-entrepreneurs

Contexte utilisateur: ${context || 'Utilisateur général'}

Réponds toujours en français, sois professionnel mais accessible, et encourage l'utilisation de la plateforme pour réussir les projets d'investissement.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedResponse = data.choices[0].message.content;

    console.log('Chatbot response generated successfully');

    return new Response(JSON.stringify({ 
      response: generatedResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in chatbot function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});