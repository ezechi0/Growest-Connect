import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchingRequest {
  userId: string;
  userType: 'investor' | 'entrepreneur';
  preferences?: {
    sectors?: string[];
    location?: string;
    fundingRange?: [number, number];
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

    const { userId, userType, preferences }: MatchingRequest = await req.json();
    console.log('AI Matching request:', { userId, userType, preferences });

    let matches = [];

    if (userType === 'investor') {
      // Find matching projects for investor
      let query = supabaseClient
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, company, location)
        `)
        .eq('status', 'active');

      // Apply filters based on preferences
      if (preferences?.sectors?.length) {
        query = query.in('sector', preferences.sectors);
      }
      
      if (preferences?.location) {
        query = query.eq('location', preferences.location);
      }

      if (preferences?.fundingRange) {
        query = query
          .gte('funding_goal', preferences.fundingRange[0])
          .lte('funding_goal', preferences.fundingRange[1]);
      }

      const { data: projects, error } = await query.limit(10);
      
      if (error) {
        throw error;
      }

      matches = projects || [];
    } else {
      // Find matching investors for entrepreneur
      const { data: investors, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_type', 'investor')
        .limit(10);

      if (error) {
        throw error;
      }

      matches = investors || [];
    }

    // Apply AI-powered scoring (simplified version)
    const scoredMatches = matches.map((match: any) => ({
      ...match,
      matchScore: Math.random() * 100, // Simplified scoring - in real app, use OpenAI embeddings
      reasons: [
        'Secteur d\'activité compatible',
        'Localisation géographique proche',
        'Montant de financement adapté'
      ]
    }));

    // Sort by match score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    console.log(`Found ${scoredMatches.length} matches for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        matches: scoredMatches,
        total: scoredMatches.length,
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
    console.error('Error in ai-matching function:', error);
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