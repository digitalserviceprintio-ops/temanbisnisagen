
-- Drop restrictive policies and replace with permissive ones
DROP POLICY IF EXISTS "Allow all on admin_settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Allow all on daily_status" ON public.daily_status;
DROP POLICY IF EXISTS "Allow all on transactions" ON public.transactions;

CREATE POLICY "Allow all on admin_settings" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on daily_status" ON public.daily_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
