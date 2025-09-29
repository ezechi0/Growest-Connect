-- Update subscription plans for test mode with affordable prices
TRUNCATE TABLE public.subscription_plans;

INSERT INTO public.subscription_plans (
  plan_id, 
  name, 
  description, 
  price, 
  currency,
  interval_type,
  target_role,
  features,
  is_active
) VALUES 
  (
    'premium_test', 
    'Premium Test', 
    'Version test complète à 1€ pour découvrir toutes les fonctionnalités',
    100, -- 1€ en centimes
    'EUR',
    'monthly',
    'both',
    '["✨ Accès complet pendant 30 jours", "🚀 Visibilité maximale des projets", "🤝 Matching IA avancé", "📊 Analytics exclusifs", "💬 Support prioritaire 24/7", "🔔 Notifications premium", "🎯 Recommandations personnalisées"]'::jsonb,
    true
  ),
  (
    'premium_starter', 
    'Premium Starter', 
    'Pour commencer son aventure entrepreneuriale',
    2500, -- 25€ en centimes
    'EUR',
    'monthly',
    'both',
    '["🔥 Toutes les fonctionnalités Premium Test", "💎 Badge exclusif", "📈 Statistiques avancées", "🎬 Vidéos pitch prioritaires", "🤖 Assistant IA personnel", "🌟 Profil vérifié"]'::jsonb,
    true
  );