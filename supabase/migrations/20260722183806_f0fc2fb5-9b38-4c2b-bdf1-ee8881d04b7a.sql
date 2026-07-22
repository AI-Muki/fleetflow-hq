
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','owner','manager','mechanic','driver','accountant');
CREATE TYPE public.asset_status AS ENUM ('active','in_maintenance','retired','unavailable');
CREATE TYPE public.assignment_status AS ENUM ('active','returned','cancelled');
CREATE TYPE public.assignment_phase AS ENUM ('checkout','checkin');
CREATE TYPE public.maintenance_status AS ENUM ('scheduled','in_progress','completed','cancelled');
CREATE TYPE public.maintenance_type AS ENUM ('scheduled','repair','inspection');
CREATE TYPE public.fuel_type AS ENUM ('gasoline','diesel','electric','hybrid','lpg');
CREATE TYPE public.document_kind AS ENUM ('registration','insurance','inspection','license','other');
CREATE TYPE public.damage_severity AS ENUM ('low','medium','high','critical');
CREATE TYPE public.driver_status AS ENUM ('active','suspended','inactive');

-- ============ COMPANIES ============
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ COMPANY MEMBERS (roles) ============
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'driver',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_members TO authenticated;
GRANT ALL ON public.company_members TO service_role;
ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.is_company_member(_company_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = _company_id AND user_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.has_company_role(_company_id uuid, _user_id uuid, _roles public.app_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = _company_id AND user_id = _user_id AND role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.user_companies(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.company_members WHERE user_id = _user_id;
$$;

-- ============ COMPANY / PROFILE / MEMBER POLICIES ============
CREATE POLICY "members read own profile row"
  ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "read companies I belong to"
  ON public.companies FOR SELECT TO authenticated
  USING (public.is_company_member(id, auth.uid()));
CREATE POLICY "authenticated can create companies"
  ON public.companies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "owners/admins update company"
  ON public.companies FOR UPDATE TO authenticated
  USING (public.has_company_role(id, auth.uid(), ARRAY['owner','admin']::public.app_role[]))
  WITH CHECK (public.has_company_role(id, auth.uid(), ARRAY['owner','admin']::public.app_role[]));

CREATE POLICY "members read company members"
  ON public.company_members FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "owners/admins manage members"
  ON public.company_members FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin']::public.app_role[]));

-- ============ AUTO-CREATE PROFILE + PERSONAL COMPANY ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_company_id uuid;
  display_name text;
BEGIN
  display_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1));
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, display_name)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.companies (name, created_by)
  VALUES (COALESCE(display_name,'My Fleet') || '''s Fleet', NEW.id)
  RETURNING id INTO new_company_id;

  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (new_company_id, NEW.id, 'owner');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ UPDATED_AT HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ ASSETS ============
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  plate text,
  vin text,
  make text,
  model text,
  year int,
  vehicle_type text,
  status public.asset_status NOT NULL DEFAULT 'active',
  odometer int NOT NULL DEFAULT 0,
  fuel_type public.fuel_type,
  image_url text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT ALL ON public.assets TO service_role;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_assets_company ON public.assets(company_id);
CREATE TRIGGER trg_assets_updated BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "members read assets" ON public.assets FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers write assets" ON public.assets FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ DRIVERS ============
CREATE TABLE public.drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  license_number text,
  license_expiry date,
  status public.driver_status NOT NULL DEFAULT 'active',
  avatar_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.drivers TO authenticated;
GRANT ALL ON public.drivers TO service_role;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_drivers_company ON public.drivers(company_id);
CREATE TRIGGER trg_drivers_updated BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "members read drivers" ON public.drivers FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers write drivers" ON public.drivers FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ ASSIGNMENTS ============
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  status public.assignment_status NOT NULL DEFAULT 'active',
  start_at timestamptz NOT NULL DEFAULT now(),
  end_at timestamptz,
  checkout_odometer int,
  checkin_odometer int,
  checkout_notes text,
  checkin_notes text,
  checkout_signature_url text,
  checkin_signature_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignments TO authenticated;
GRANT ALL ON public.assignments TO service_role;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_assignments_company ON public.assignments(company_id);
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "members read assignments" ON public.assignments FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers write assignments" ON public.assignments FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ ASSIGNMENT PHOTOS ============
CREATE TABLE public.assignment_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  phase public.assignment_phase NOT NULL,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assignment_photos TO authenticated;
GRANT ALL ON public.assignment_photos TO service_role;
ALTER TABLE public.assignment_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read assignment photos" ON public.assignment_photos FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers write assignment photos" ON public.assignment_photos FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ DAMAGE REPORTS ============
CREATE TABLE public.damage_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES public.assignments(id) ON DELETE SET NULL,
  severity public.damage_severity NOT NULL DEFAULT 'low',
  description text NOT NULL,
  reported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  cost numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.damage_reports TO authenticated;
GRANT ALL ON public.damage_reports TO service_role;
ALTER TABLE public.damage_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read damage" ON public.damage_reports FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "members write damage" ON public.damage_reports FOR INSERT TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers update damage" ON public.damage_reports FOR UPDATE TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','mechanic']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','mechanic']::public.app_role[]));
CREATE POLICY "managers delete damage" ON public.damage_reports FOR DELETE TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ MAINTENANCE ============
CREATE TABLE public.maintenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  type public.maintenance_type NOT NULL DEFAULT 'scheduled',
  status public.maintenance_status NOT NULL DEFAULT 'scheduled',
  scheduled_date date,
  completed_date date,
  odometer int,
  cost numeric(12,2),
  vendor text,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.maintenance TO authenticated;
GRANT ALL ON public.maintenance TO service_role;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_maintenance_updated BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY "members read maintenance" ON public.maintenance FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "mechanics write maintenance" ON public.maintenance FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','mechanic']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','mechanic']::public.app_role[]));

-- ============ FUEL LOGS ============
CREATE TABLE public.fuel_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE SET NULL,
  logged_at timestamptz NOT NULL DEFAULT now(),
  liters numeric(10,2) NOT NULL,
  cost numeric(12,2) NOT NULL,
  odometer int,
  station text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fuel_logs TO authenticated;
GRANT ALL ON public.fuel_logs TO service_role;
ALTER TABLE public.fuel_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read fuel" ON public.fuel_logs FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "members write fuel" ON public.fuel_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers update fuel" ON public.fuel_logs FOR UPDATE TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','accountant']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','accountant']::public.app_role[]));
CREATE POLICY "managers delete fuel" ON public.fuel_logs FOR DELETE TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ EXPENSES ============
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.assets(id) ON DELETE SET NULL,
  category text NOT NULL,
  amount numeric(12,2) NOT NULL,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  receipt_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expenses TO authenticated;
GRANT ALL ON public.expenses TO service_role;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read expenses" ON public.expenses FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "accountants write expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','accountant']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager','accountant']::public.app_role[]));

-- ============ DOCUMENTS ============
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  driver_id uuid REFERENCES public.drivers(id) ON DELETE CASCADE,
  kind public.document_kind NOT NULL DEFAULT 'other',
  name text NOT NULL,
  expiry_date date,
  storage_path text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read documents" ON public.documents FOR SELECT TO authenticated
  USING (public.is_company_member(company_id, auth.uid()));
CREATE POLICY "managers write documents" ON public.documents FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- ============ STORAGE POLICIES ============
-- avatars: users manage their own folder (path: <user_id>/...)
CREATE POLICY "avatar read own" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar write own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar update own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar delete own" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- company-scoped buckets: path pattern is <company_id>/...
-- asset-photos
CREATE POLICY "asset photo read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'asset-photos' AND public.is_company_member(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "asset photo write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'asset-photos' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "asset photo update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'asset-photos' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "asset photo delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'asset-photos' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- assignment-media
CREATE POLICY "assignment media read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'assignment-media' AND public.is_company_member(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "assignment media write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assignment-media' AND public.is_company_member(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "assignment media update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'assignment-media' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "assignment media delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'assignment-media' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));

-- documents
CREATE POLICY "docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_company_member(((storage.foldername(name))[1])::uuid, auth.uid()));
CREATE POLICY "docs write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "docs update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
CREATE POLICY "docs delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.has_company_role(((storage.foldername(name))[1])::uuid, auth.uid(), ARRAY['owner','admin','manager']::public.app_role[]));
