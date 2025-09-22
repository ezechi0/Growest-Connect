-- Correction des problèmes de sécurité détectés par le linter

-- Mise à jour de la fonction update_updated_at_column avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Mise à jour de la fonction get_project_stats avec search_path sécurisé
CREATE OR REPLACE FUNCTION public.get_project_stats(project_uuid UUID)
RETURNS TABLE(
  total_investors BIGINT,
  funding_percentage NUMERIC
) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT t.investor_id) as total_investors,
    CASE 
      WHEN p.funding_goal > 0 THEN ROUND((p.current_funding / p.funding_goal) * 100, 2)
      ELSE 0 
    END as funding_percentage
  FROM public.projects p
  LEFT JOIN public.transactions t ON p.id = t.project_id AND t.status = 'completed'
  WHERE p.id = project_uuid
  GROUP BY p.id, p.current_funding, p.funding_goal;
END;
$$;