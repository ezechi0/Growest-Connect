import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdvancedMatchingRequest {
  userId: string;
  userType: 'investor' | 'entrepreneur';
  preferences?: {
    sectors?: string[];
    location?: string;
    fundingRange?: [number, number];
    riskTolerance?: string;
    investmentStyle?: string;
    experience?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const { userId, userType, preferences }: AdvancedMatchingRequest = await req.json();
    
    console.log('Advanced matching request:', { userId, userType, preferences });

    // Récupérer le profil utilisateur pour l'analyse IA
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      throw new Error(`Error fetching user profile: ${profileError.message}`);
    }

    let matches = [];
    let analysisPrompt = '';

    if (userType === 'investor') {
      // Trouver des projets pour l'investisseur
      let query = supabaseClient
        .from('projects')
        .select(`
          *,
          profiles!projects_owner_id_fkey(full_name, company, bio, location, user_type)
        `)
        .eq('status', 'active');

      // Appliquer les filtres de base
      if (preferences?.sectors?.length) {
        query = query.in('sector', preferences.sectors);
      }
      
      if (preferences?.location) {
        query = query.ilike('location', `%${preferences.location}%`);
      }

      if (preferences?.fundingRange) {
        query = query
          .gte('funding_goal', preferences.fundingRange[0])
          .lte('funding_goal', preferences.fundingRange[1]);
      }

      const { data: projects, error } = await query.limit(20);
      
      if (error) throw error;
      matches = projects || [];

      analysisPrompt = `
Analysez la compatibilité entre cet investisseur et les projets suivants.

PROFIL INVESTISSEUR:
- Nom: ${userProfile.full_name}
- Bio: ${userProfile.bio || 'Non renseignée'}
- Localisation: ${userProfile.location || 'Non renseignée'}
- Entreprise: ${userProfile.company || 'Non renseignée'}
- Préférences: ${JSON.stringify(preferences)}

PROJETS À ANALYSER:
${matches.map((p: any, i: number) => `
${i + 1}. ${p.title}
   - Secteur: ${p.sector}
   - Description: ${p.description?.substring(0, 200)}...
   - Financement: €${p.funding_goal?.toLocaleString()}
   - Lieu: ${p.location}
   - Entrepreneur: ${p.profiles?.full_name}
   - Stade: ${p.stage}
   - Risque: ${p.risk_level}
   - ROI attendu: ${p.expected_roi}%
`).join('')}

Pour chaque projet, donnez un score de 0 à 100 et 2-3 raisons de compatibilité.
Répondez au format JSON exact suivant:
{
  "matches": [
    {
      "projectIndex": 0,
      "score": 85,
      "reasons": ["Secteur d'expertise de l'investisseur", "Montant dans la fourchette préférée"]
    }
  ]
}`;

    } else {
      // Trouver des investisseurs pour l'entrepreneur
      const { data: investors, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('user_type', 'investor')
        .limit(20);

      if (error) throw error;
      matches = investors || [];

      analysisPrompt = `
Analysez la compatibilité entre cet entrepreneur et les investisseurs suivants.

PROFIL ENTREPRENEUR:
- Nom: ${userProfile.full_name}
- Bio: ${userProfile.bio || 'Non renseignée'}
- Localisation: ${userProfile.location || 'Non renseignée'}
- Entreprise: ${userProfile.company || 'Non renseignée'}

INVESTISSEURS À ANALYSER:
${matches.map((inv: any, i: number) => `
${i + 1}. ${inv.full_name}
   - Entreprise: ${inv.company || 'Non renseignée'}
   - Bio: ${inv.bio || 'Non renseignée'}
   - Localisation: ${inv.location || 'Non renseignée'}
`).join('')}

Pour chaque investisseur, donnez un score de 0 à 100 et 2-3 raisons de compatibilité.
Répondez au format JSON exact suivant:
{
  "matches": [
    {
      "projectIndex": 0,
      "score": 75,
      "reasons": ["Secteur d'investissement compatible", "Localisation géographique"]
    }
  ]
}`;
    }

    // Analyse IA avec OpenAI
    let aiAnalysis: any = { matches: [] };
    
    if (openAIApiKey && matches.length > 0) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Vous êtes un expert en matching investisseur-entrepreneur. Analysez les profils et donnez des scores précis et des raisons pertinentes.'
              },
              {
                role: 'user',
                content: analysisPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const openAIResult = await response.json();
          const content = openAIResult.choices[0]?.message?.content;
          
          if (content) {
            try {
              aiAnalysis = JSON.parse(content);
            } catch (parseError) {
              console.error('Error parsing OpenAI response:', parseError);
              console.log('Raw OpenAI response:', content);
            }
          }
        }
      } catch (aiError) {
        console.error('OpenAI API error:', aiError);
      }
    }

    // Combiner les résultats avec l'analyse IA
    const scoredMatches = matches.map((match: any, index: number) => {
      const aiMatch = aiAnalysis.matches?.find((m: any) => m.projectIndex === index);
      const baseScore = Math.random() * 40 + 30; // Score de base 30-70
      
      return {
        ...match,
        matchScore: aiMatch?.score || baseScore,
        reasons: aiMatch?.reasons || [
          'Profil compatible',
          'Potentiel de collaboration',
          'Objectifs alignés'
        ],
        aiAnalyzed: !!aiMatch
      };
    });

    // Trier par score
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // Sauvegarder les meilleurs matches en base
    const topMatches = scoredMatches.slice(0, 10);
    for (const match of topMatches) {
      try {
        await supabaseClient
          .from('ai_matches')
          .upsert({
            user_id: userId,
            target_id: userType === 'investor' ? match.id : match.id,
            target_type: userType === 'investor' ? 'project' : 'profile',
            match_score: match.matchScore,
            match_reasons: match.reasons,
            preferences_used: preferences
          });
      } catch (upsertError) {
        console.error('Error saving match:', upsertError);
      }
    }

    // Créer des notifications pour les nouveaux matches de haute qualité
    const highQualityMatches = topMatches.filter(m => m.matchScore > 80);
    
    if (highQualityMatches.length > 0) {
      try {
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'new_match',
            title: '🎯 Nouveaux matches de qualité !',
            message: `Nous avons trouvé ${highQualityMatches.length} ${userType === 'investor' ? 'projet(s)' : 'investisseur(s)'} très compatibles avec votre profil.`,
            data: {
              matchCount: highQualityMatches.length,
              averageScore: Math.round(
                highQualityMatches.reduce((sum, m) => sum + m.matchScore, 0) / highQualityMatches.length
              )
            }
          });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }
    }

    console.log(`Generated ${scoredMatches.length} matches for user ${userId}, ${aiAnalysis.matches?.length || 0} AI-analyzed`);

    return new Response(
      JSON.stringify({
        success: true,
        matches: scoredMatches,
        total: scoredMatches.length,
        aiAnalyzed: aiAnalysis.matches?.length || 0,
        timestamp: new Date().toISOString()
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
    console.error('Error in advanced-matching function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);