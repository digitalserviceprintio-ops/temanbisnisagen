
-- Transactions table
CREATE TABLE public.transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TARIK', 'SETOR', 'TRANSFER', 'TOPUP')),
  amount NUMERIC NOT NULL DEFAULT 0,
  fee NUMERIC NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  customer_name TEXT NOT NULL DEFAULT 'Customer Umum',
  target TEXT NOT NULL DEFAULT '-',
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  shift_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin settings table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  tarik_fee NUMERIC NOT NULL DEFAULT 5000,
  tarik_step NUMERIC NOT NULL DEFAULT 1000000,
  setor_fee NUMERIC NOT NULL DEFAULT 5000,
  setor_step NUMERIC NOT NULL DEFAULT 1000000,
  transfer_fee NUMERIC NOT NULL DEFAULT 6500,
  transfer_step NUMERIC NOT NULL DEFAULT 1000000,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Daily status table
CREATE TABLE public.daily_status (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,
  cash_start NUMERIC NOT NULL DEFAULT 0,
  bank_start NUMERIC NOT NULL DEFAULT 0,
  time_open TIMESTAMPTZ NOT NULL DEFAULT now(),
  time_closed TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_status ENABLE ROW LEVEL SECURITY;

-- RLS policies - allow all for now (no auth, using app-level user_id)
CREATE POLICY "Allow all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_status" ON public.daily_status FOR ALL USING (true) WITH CHECK (true);
