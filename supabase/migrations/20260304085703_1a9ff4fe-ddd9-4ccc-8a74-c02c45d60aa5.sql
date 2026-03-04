
-- Fix activate_license: use _license.duration_days instead of bare duration_days
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
      expires_at = now() + (_license.duration_days || ' days')::interval,
      status = 'active'
  WHERE id = _license.id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Lisensi berhasil diaktifkan',
    'expires_at', (now() + (_license.duration_days || ' days')::interval)::text,
    'duration_days', _license.duration_days
  );
END;
$$;

-- Insert 3 default licenses (skip if already exist)
INSERT INTO public.licenses (license_key, duration_days, note, status)
SELECT * FROM (VALUES
  ('SAKU-AGEN-2026-FREE', 30, 'Lisensi gratis 30 hari', 'unused'),
  ('SAKU-AGEN-PRO1-90DY', 90, 'Lisensi Pro 90 hari', 'unused'),
  ('SAKU-AGEN-FULL-365D', 365, 'Lisensi Full 1 tahun', 'unused')
) AS v(license_key, duration_days, note, status)
WHERE NOT EXISTS (
  SELECT 1 FROM public.licenses WHERE license_key = v.license_key
);
