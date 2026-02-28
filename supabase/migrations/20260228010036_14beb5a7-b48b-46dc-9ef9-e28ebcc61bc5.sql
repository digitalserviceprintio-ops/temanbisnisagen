
CREATE TABLE public.store_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL UNIQUE,
  store_name text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.store_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own store_profile"
  ON public.store_profiles
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);
