
-- Create payment_orders table
CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  user_email text NOT NULL DEFAULT '',
  plan_name text NOT NULL,
  amount numeric NOT NULL,
  duration_days integer NOT NULL,
  proof_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  verified_at timestamp with time zone,
  verified_by uuid
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

-- Users can create and read own orders
CREATE POLICY "Users create own orders" ON public.payment_orders
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (auth.uid())::text);

CREATE POLICY "Users read own orders" ON public.payment_orders
  FOR SELECT TO authenticated
  USING (user_id = (auth.uid())::text);

CREATE POLICY "Users update own pending orders" ON public.payment_orders
  FOR UPDATE TO authenticated
  USING (user_id = (auth.uid())::text AND status = 'pending')
  WITH CHECK (user_id = (auth.uid())::text);

-- Admins manage all orders
CREATE POLICY "Admins manage all orders" ON public.payment_orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- Storage policies
CREATE POLICY "Users upload own proofs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND (storage.foldername(name))[1] = (auth.uid())::text);

CREATE POLICY "Anyone can read proofs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

-- Function to approve payment and auto-activate license
CREATE OR REPLACE FUNCTION public.approve_payment(_order_id uuid, _admin_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _order RECORD;
  _key TEXT;
BEGIN
  SELECT * INTO _order FROM public.payment_orders WHERE id = _order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order tidak ditemukan');
  END IF;
  
  IF _order.status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Order sudah diproses');
  END IF;
  
  -- Generate license key
  _key := 'PRE-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4)) || '-' || upper(substr(md5(random()::text), 1, 4));
  
  -- Deactivate old licenses for this user
  UPDATE public.licenses SET status = 'expired' WHERE user_id = _order.user_id AND status = 'active';
  
  -- Create and activate new license
  INSERT INTO public.licenses (license_key, user_id, user_email, duration_days, status, activated_at, expires_at, note)
  VALUES (
    _key,
    _order.user_id,
    _order.user_email,
    _order.duration_days,
    'active',
    now(),
    now() + (_order.duration_days || ' days')::interval,
    'Premium ' || _order.plan_name || ' - pembayaran otomatis'
  );
  
  -- Mark order as approved
  UPDATE public.payment_orders SET status = 'approved', verified_at = now(), verified_by = _admin_id WHERE id = _order_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'Pembayaran disetujui & lisensi aktif', 'license_key', _key);
END;
$$;
