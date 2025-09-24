import { supabase } from '@/integrations/supabase/client';

// Données fictives pour les tests
export const seedTestData = async () => {
  try {
    console.log('🌱 Début du chargement des données de test...');

    // 1. Créer des profils d'investisseurs fictifs
    const investorProfiles = [
      {
        id: 'investor-1',
        full_name: 'Marie Dubois',
        user_type: 'investor',
        role: 'investor',
        company: 'Capital Ventures',
        bio: 'Investisseuse expérimentée dans la tech',
        location: 'Paris, France',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
        is_verified: true,
        kyc_status: 'approved'
      },
      {
        id: 'investor-2',
        full_name: 'Jean Martin',
        user_type: 'investor',
        role: 'investor',
        company: 'Innovation Fund',
        bio: 'Spécialiste des investissements en santé',
        location: 'Lyon, France',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jean',
        is_verified: true,
        kyc_status: 'approved'
      },
      {
        id: 'investor-3',
        full_name: 'Sarah Johnson',
        user_type: 'investor',
        role: 'investor',
        company: 'Global Angels',
        bio: 'Business angel internationale',
        location: 'Londres, UK',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        is_verified: true,
        kyc_status: 'approved'
      }
    ];

    // 2. Créer des profils d'entrepreneurs fictifs
    const entrepreneurProfiles = [
      {
        id: 'entrepreneur-1',
        full_name: 'Alex Thompson',
        user_type: 'entrepreneur',
        role: 'entrepreneur',
        company: 'EcoTech Solutions',
        bio: 'Fondateur passionné par les technologies vertes',
        location: 'Montpellier, France',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        is_verified: true,
        kyc_status: 'approved'
      },
      {
        id: 'entrepreneur-2',
        full_name: 'Fatima El Kadiri',
        user_type: 'entrepreneur',
        role: 'entrepreneur',
        company: 'MedTech Innovations',
        bio: 'CEO spécialisée en technologies médicales',
        location: 'Casablanca, Maroc',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima',
        is_verified: true,
        kyc_status: 'approved'
      },
      {
        id: 'entrepreneur-3',
        full_name: 'David Koné',
        user_type: 'entrepreneur',
        role: 'entrepreneur',
        company: 'AgriSmart',
        bio: 'Innovateur en agriculture intelligente',
        location: 'Abidjan, Côte d\'Ivoire',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        is_verified: true,
        kyc_status: 'approved'
      }
    ];

    // Insérer les profils
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert([...investorProfiles, ...entrepreneurProfiles]);

    if (profilesError) throw profilesError;

    // 3. Créer des projets fictifs
    const testProjects = [
      {
        id: 'project-1',
        title: 'EcoPackaging Revolution',
        description: 'Plateforme innovante pour des emballages 100% biodégradables utilisant des déchets agricoles. Notre solution réduit les coûts de 30% tout en éliminant les plastiques traditionnels.',
        owner_id: 'entrepreneur-1',
        sector: 'technology',
        location: 'Montpellier, France',
        funding_goal: 250000,
        current_funding: 75000,
        min_investment: 5000,
        max_investment: 50000,
        status: 'active',
        stage: 'growth',
        risk_level: 'medium',
        expected_roi: 25,
        team_size: 8,
        business_model: 'B2B marketplace avec commissions sur les ventes',
        target_market: 'Industries alimentaires et cosmétiques européennes',
        revenue_model: 'Abonnement SaaS + commissions sur transactions',
        tags: ['sustainability', 'packaging', 'b2b'],
        images: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400'],
        pitch_deck_url: 'https://example.com/pitch-ecopack.pdf'
      },
      {
        id: 'project-2',
        title: 'AI Health Diagnostics',
        description: 'Intelligence artificielle révolutionnaire pour le diagnostic médical précoce. Notre IA détecte 95% des pathologies avec 48h d\'avance sur les méthodes traditionnelles.',
        owner_id: 'entrepreneur-2',
        sector: 'healthcare',
        location: 'Casablanca, Maroc',
        funding_goal: 500000,
        current_funding: 120000,
        min_investment: 10000,
        max_investment: 100000,
        status: 'active',
        stage: 'seed',
        risk_level: 'high',
        expected_roi: 40,
        team_size: 12,
        business_model: 'Licences logicielles aux hôpitaux et cliniques',
        target_market: 'Établissements de santé en Afrique et Moyen-Orient',
        revenue_model: 'Licences annuelles + maintenance technique',
        tags: ['ai', 'healthcare', 'diagnostics'],
        images: ['https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400'],
        pitch_deck_url: 'https://example.com/pitch-aihealth.pdf'
      },
      {
        id: 'project-3',
        title: 'Smart Farm Network',
        description: 'Réseau IoT pour l\'agriculture intelligente. Capteurs connectés et IA pour optimiser rendements et réduire consommation d\'eau de 40%.',
        owner_id: 'entrepreneur-3',
        sector: 'agriculture',
        location: 'Abidjan, Côte d\'Ivoire',
        funding_goal: 180000,
        current_funding: 45000,
        min_investment: 3000,
        max_investment: 30000,
        status: 'active',
        stage: 'ideation',
        risk_level: 'medium',
        expected_roi: 30,
        team_size: 6,
        business_model: 'Vente de capteurs + abonnement plateforme',
        target_market: 'Petites et moyennes exploitations agricoles',
        revenue_model: 'Hardware + SaaS mensuel',
        tags: ['iot', 'agriculture', 'sustainability'],
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
        pitch_deck_url: 'https://example.com/pitch-smartfarm.pdf'
      },
      {
        id: 'project-4',
        title: 'FinTech Mobile Solutions',
        description: 'Application mobile révolutionnaire pour les paiements mobiles en Afrique. Interface intuitive et transactions sécurisées pour l\'inclusion financière.',
        owner_id: 'entrepreneur-1',
        sector: 'fintech',
        location: 'Dakar, Sénégal',
        funding_goal: 300000,
        current_funding: 80000,
        min_investment: 5000,
        max_investment: 75000,
        status: 'active',
        stage: 'growth',
        risk_level: 'medium',
        expected_roi: 35,
        team_size: 15,
        business_model: 'Commissions sur transactions + services premium',
        target_market: 'Population non bancarisée en Afrique de l\'Ouest',
        revenue_model: 'Commissions + abonnements premium',
        tags: ['fintech', 'mobile', 'africa'],
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400'],
        pitch_deck_url: 'https://example.com/pitch-fintech.pdf'
      }
    ];

    const { error: projectsError } = await supabase
      .from('projects')
      .upsert(testProjects);

    if (projectsError) throw projectsError;

    // 4. Créer des intérêts de projet
    const projectInterests = [
      {
        project_id: 'project-1',
        investor_id: 'investor-1',
        investment_amount: 25000,
        interest_level: 'very_interested',
        message: 'Très intéressée par cette solution durable. J\'aimerais discuter des détails.',
        status: 'pending'
      },
      {
        project_id: 'project-2',
        investor_id: 'investor-2',
        investment_amount: 50000,
        interest_level: 'interested',
        message: 'L\'IA médicale est un secteur prometteur. Quels sont vos retours clients?',
        status: 'pending'
      },
      {
        project_id: 'project-3',
        investor_id: 'investor-3',
        investment_amount: 15000,
        interest_level: 'very_interested',
        message: 'L\'AgriTech est notre spécialité. Planifions une démonstration.',
        status: 'pending'
      }
    ];

    const { error: interestsError } = await supabase
      .from('project_interests')
      .upsert(projectInterests);

    if (interestsError) throw interestsError;

    // 5. Créer des transactions de test
    const testTransactions = [
      {
        project_id: 'project-1',
        investor_id: 'investor-1',
        amount: 25000,
        currency: 'EUR',
        status: 'completed',
        commission_amount: 1250,
        net_amount: 23750,
        payment_method: 'card',
        paystack_reference: 'test-ref-001',
        receipt_number: 'REC-20240101-001',
        transaction_type: 'investment'
      },
      {
        project_id: 'project-2',
        investor_id: 'investor-2',
        amount: 30000,
        currency: 'EUR',
        status: 'completed',
        commission_amount: 1500,
        net_amount: 28500,
        payment_method: 'mobile_money',
        paystack_reference: 'test-ref-002',
        receipt_number: 'REC-20240102-002',
        transaction_type: 'investment'
      }
    ];

    const { error: transactionsError } = await supabase
      .from('transactions')
      .upsert(testTransactions);

    if (transactionsError) throw transactionsError;

    // 6. Créer des demandes de connexion
    const connectionRequests = [
      {
        project_id: 'project-1',
        investor_id: 'investor-1',
        entrepreneur_id: 'entrepreneur-1',
        message: 'Bonjour, votre projet m\'intéresse beaucoup. Pouvons-nous planifier un appel?',
        status: 'accepted'
      },
      {
        project_id: 'project-3',
        investor_id: 'investor-3',
        entrepreneur_id: 'entrepreneur-3',
        message: 'Excellent concept AgriTech! J\'ai de l\'expérience dans ce domaine.',
        status: 'pending'
      }
    ];

    const { error: connectionsError } = await supabase
      .from('connection_requests')
      .upsert(connectionRequests);

    if (connectionsError) throw connectionsError;

    // 7. Créer des favoris
    const favorites = [
      {
        user_id: 'investor-1',
        project_id: 'project-2'
      },
      {
        user_id: 'investor-2',
        project_id: 'project-3'
      },
      {
        user_id: 'investor-3',
        project_id: 'project-1'
      }
    ];

    const { error: favoritesError } = await supabase
      .from('project_favorites')
      .upsert(favorites);

    if (favoritesError) throw favoritesError;

    console.log('✅ Données de test chargées avec succès!');
    return {
      success: true,
      data: {
        investors: investorProfiles.length,
        entrepreneurs: entrepreneurProfiles.length,
        projects: testProjects.length,
        interests: projectInterests.length,
        transactions: testTransactions.length,
        connections: connectionRequests.length,
        favorites: favorites.length
      }
    };

  } catch (error) {
    console.error('❌ Erreur lors du chargement des données:', error);
    throw error;
  }
};

// Fonction pour nettoyer les données de test
export const clearTestData = async () => {
  try {
    console.log('🧹 Nettoyage des données de test...');

    // IDs à supprimer
    const testIds = [
      'investor-1', 'investor-2', 'investor-3',
      'entrepreneur-1', 'entrepreneur-2', 'entrepreneur-3',
      'project-1', 'project-2', 'project-3', 'project-4'
    ];

    // Nettoyer chaque table individuellement
    await supabase.from('project_favorites').delete().in('user_id', testIds);
    await supabase.from('connection_requests').delete().in('investor_id', testIds);
    await supabase.from('transactions').delete().in('investor_id', testIds);
    await supabase.from('project_interests').delete().in('investor_id', testIds);
    await supabase.from('projects').delete().in('id', testIds);
    await supabase.from('profiles').delete().in('id', testIds);

    console.log('✅ Données de test nettoyées!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    throw error;
  }
};