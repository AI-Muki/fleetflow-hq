import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export type Company = { id: string; name: string; logo_url: string | null };
export type Membership = { role: "admin" | "owner" | "manager" | "mechanic" | "driver" | "accountant"; company: Company };

const STORAGE_KEY = "fleetflow.current_company";

type Ctx = {
  companies: Membership[];
  current: Membership | null;
  setCurrent: (id: string) => void;
  loading: boolean;
};

const CompanyCtx = createContext<Ctx>({ companies: [], current: null, setCurrent: () => {}, loading: true });

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [currentId, setCurrentId] = useState<string | null>(
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY),
  );

  const { data, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["memberships", user?.id],
    queryFn: async (): Promise<Membership[]> => {
      const { data, error } = await supabase
        .from("company_members")
        .select("role, company:companies(id, name, logo_url)")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as unknown as Membership[]) ?? [];
    },
  });

  const companies = data ?? [];

  useEffect(() => {
    if (!companies.length) return;
    if (!currentId || !companies.some((m) => m.company.id === currentId)) {
      const first = companies[0].company.id;
      setCurrentId(first);
      localStorage.setItem(STORAGE_KEY, first);
    }
  }, [companies, currentId]);

  const current = useMemo(
    () => companies.find((m) => m.company.id === currentId) ?? null,
    [companies, currentId],
  );

  const setCurrent = (id: string) => {
    setCurrentId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <CompanyCtx.Provider value={{ companies, current, setCurrent, loading: authLoading || isLoading }}>
      {children}
    </CompanyCtx.Provider>
  );
}

export const useCompany = () => useContext(CompanyCtx);
export const useCurrentCompanyId = () => useCompany().current?.company.id ?? null;
