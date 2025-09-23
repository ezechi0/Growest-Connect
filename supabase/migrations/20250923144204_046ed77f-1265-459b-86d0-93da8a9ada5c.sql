-- Mise à jour de la fonction handle_new_user pour gérer les rôles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    user_type,
    role,
    company
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'entrepreneur'),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'investor' THEN 'investor'
      WHEN NEW.raw_user_meta_data ->> 'user_type' = 'admin' THEN 'admin'
      ELSE 'entrepreneur'
    END,
    NEW.raw_user_meta_data ->> 'company'
  );
  RETURN NEW;
END;
$$;