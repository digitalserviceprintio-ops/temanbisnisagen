
CREATE OR REPLACE FUNCTION public.auto_grant_free_license()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _key TEXT;
BEGIN
  -- Generate a random license key
  _key := 'FREE-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));
  
  INSERT INTO public.licenses (license_key, user_id, user_email, duration_days, status, activated_at, expires_at, note)
  VALUES (
    _key,
    NEW.id::text,
    COALESCE(NEW.email, ''),
    30,
    'active',
    now(),
    now() + interval '30 days',
    'Auto-granted free trial'
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created_grant_license
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_free_license();
