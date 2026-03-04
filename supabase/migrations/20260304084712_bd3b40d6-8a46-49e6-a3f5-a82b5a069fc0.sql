
-- Function to extend an active license by additional days
CREATE OR REPLACE FUNCTION public.extend_license(_license_id uuid, _extra_days integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _license RECORD;
  _new_expires timestamp with time zone;
BEGIN
  SELECT * INTO _license FROM public.licenses WHERE id = _license_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Lisensi tidak ditemukan');
  END IF;
  
  IF _license.status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Hanya lisensi aktif yang bisa diperpanjang');
  END IF;
  
  -- Extend from current expiry or now, whichever is later
  _new_expires := GREATEST(_license.expires_at, now()) + (_extra_days || ' days')::interval;
  
  UPDATE public.licenses
  SET expires_at = _new_expires,
      duration_days = duration_days + _extra_days
  WHERE id = _license_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Lisensi berhasil diperpanjang ' || _extra_days || ' hari',
    'new_expires_at', _new_expires::text
  );
END;
$$;
