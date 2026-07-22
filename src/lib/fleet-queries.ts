import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentCompanyId } from "@/hooks/use-company";

/* ---------- ASSETS ---------- */
export function useAssets() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["assets", cid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets").select("*").eq("company_id", cid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAsset(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["asset", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async (payload: {
      name: string; plate?: string; make?: string; model?: string; year?: number;
      vehicle_type?: string; fuel_type?: string; odometer?: number;
    }) => {
      if (!cid) throw new Error("No workspace selected");
      const { data: u } = await supabase.auth.getUser();
      const { data, error } = await supabase.from("assets").insert({
        ...payload, company_id: cid, created_by: u.user?.id,
      } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets", cid] }),
  });
}

/* ---------- DRIVERS ---------- */
export function useDrivers() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["drivers", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("drivers").select("*").eq("company_id", cid!).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async (payload: {
      full_name: string; email?: string; phone?: string;
      license_number?: string; license_expiry?: string;
    }) => {
      if (!cid) throw new Error("No workspace selected");
      const { data, error } = await supabase.from("drivers").insert({ ...payload, company_id: cid } as never).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers", cid] }),
  });
}

/* ---------- ASSIGNMENTS ---------- */
export function useAssignments() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["assignments", cid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, asset:assets(id,name,plate), driver:drivers(id,full_name,avatar_url)")
        .eq("company_id", cid!).order("start_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- MAINTENANCE ---------- */
export function useMaintenance() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["maintenance", cid],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*, asset:assets(id,name,plate)")
        .eq("company_id", cid!).order("scheduled_date", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- FUEL ---------- */
export function useFuelLogs() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["fuel", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("fuel_logs")
        .select("*, asset:assets(id,name,plate)")
        .eq("company_id", cid!).order("logged_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- EXPENSES ---------- */
export function useExpenses() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["expenses", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("*").eq("company_id", cid!).order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- DAMAGE ---------- */
export function useDamageReports() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["damage", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("damage_reports")
        .select("*, asset:assets(id,name,plate)")
        .eq("company_id", cid!).order("reported_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

/* ---------- DOCUMENTS ---------- */
export function useDocuments() {
  const cid = useCurrentCompanyId();
  return useQuery({
    enabled: !!cid,
    queryKey: ["documents", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("documents")
        .select("*, asset:assets(id,name,plate), driver:drivers(id,full_name)")
        .eq("company_id", cid!).order("expiry_date", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });
}
