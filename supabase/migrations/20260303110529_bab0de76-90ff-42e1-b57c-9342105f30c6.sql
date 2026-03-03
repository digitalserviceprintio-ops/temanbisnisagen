
-- User roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admins can manage all roles
CREATE POLICY "Admins manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Licenses table
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  user_id text DEFAULT NULL,
  user_email text DEFAULT NULL,
  duration_days integer NOT NULL DEFAULT 30,
  activated_at timestamp with time zone DEFAULT NULL,
  expires_at timestamp with time zone DEFAULT NULL,
  status text NOT NULL DEFAULT 'unused',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) DEFAULT NULL,
  note text DEFAULT ''
);
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read their own license
CREATE POLICY "Users read own license" ON public.licenses
  FOR SELECT TO authenticated
  USING (user_id = (auth.uid())::text);

-- Users can update (activate) unused licenses
CREATE POLICY "Users activate license" ON public.licenses
  FOR UPDATE TO authenticated
  USING (status = 'unused' OR user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

-- Admins can do everything with licenses
CREATE POLICY "Admins manage licenses" ON public.licenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to check if user has valid license
CREATE OR REPLACE FUNCTION public.check_license(_user_id text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT jsonb_build_object(
      'valid', true,
      'license_key', license_key,
      'expires_at', expires_at,
      'days_remaining', GREATEST(0, EXTRACT(DAY FROM expires_at - now())::integer)
    )
    FROM public.licenses
    WHERE user_id = _user_id
      AND status = 'active'
      AND expires_at > now()
    ORDER BY expires_at DESC
    LIMIT 1),
    jsonb_build_object('valid', false)
  )
$$;

-- Function to activate a license
CREATE OR REPLACE FUNCTION public.activate_license(_license_key text, _user_id text, _user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _license RECORD;
BEGIN
  SELECT * INTO _license FROM public.licenses WHERE license_key = _license_key;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kode lisensi tidak ditemukan');
  END IF;
  
  IF _license.status = 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kode lisensi sudah digunakan');
  END IF;
  
  IF _license.status = 'revoked' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kode lisensi telah dicabut');
  END IF;
  
  UPDATE public.licenses
  SET user_id = _user_id,
      user_email = _user_email,
      activated_at = now(),
      expires_at = now() + (duration_days || ' days')::interval,
      status = 'active'
  WHERE id = _license.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Lisensi berhasil diaktifkan',
    'expires_at', (now() + (duration_days || ' days')::interval)::text,
    'duration_days', _license.duration_days
  );
END;
$$;
