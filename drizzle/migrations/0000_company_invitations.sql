CREATE TABLE public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'driver',
  invited_by uuid,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_invitations TO authenticated;
GRANT ALL ON public.company_invitations TO service_role;
ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owners/admins manage invitations" ON public.company_invitations FOR ALL TO authenticated
  USING (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin']::app_role[]))
  WITH CHECK (public.has_company_role(company_id, auth.uid(), ARRAY['owner','admin']::app_role[]));

CREATE OR REPLACE FUNCTION public.accept_my_invitations()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE my_email text; n integer := 0; inv record;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;
  SELECT lower(email) INTO my_email FROM auth.users WHERE id = auth.uid();
  FOR inv IN SELECT * FROM public.company_invitations WHERE lower(email) = my_email AND accepted_at IS NULL LOOP
    INSERT INTO public.company_members (company_id, user_id, role)
    SELECT inv.company_id, auth.uid(), inv.role
    WHERE NOT EXISTS (SELECT 1 FROM public.company_members WHERE company_id = inv.company_id AND user_id = auth.uid());
    UPDATE public.company_invitations SET accepted_at = now() WHERE id = inv.id;
    n := n + 1;
  END LOOP;
  RETURN n;
END $$;
REVOKE EXECUTE ON FUNCTION public.accept_my_invitations() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_my_invitations() TO authenticated;

CREATE OR REPLACE FUNCTION public.company_member_list(_company_id uuid)
RETURNS TABLE (member_id uuid, user_id uuid, role app_role, full_name text, email text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.user_id, m.role, p.full_name, u.email::text, m.created_at
  FROM public.company_members m
  LEFT JOIN public.profiles p ON p.id = m.user_id
  LEFT JOIN auth.users u ON u.id = m.user_id
  WHERE m.company_id = _company_id AND public.is_company_member(_company_id, auth.uid())
  ORDER BY m.created_at;
$$;
REVOKE EXECUTE ON FUNCTION public.company_member_list(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.company_member_list(uuid) TO authenticated;