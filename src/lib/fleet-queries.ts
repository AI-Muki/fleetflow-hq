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

export type AssetPatch = {
  name?: string; plate?: string | null; vin?: string | null; make?: string | null; model?: string | null;
  year?: number | null; vehicle_type?: string | null; fuel_type?: string | null;
  odometer?: number | null; status?: "active" | "in_maintenance" | "retired" | "unavailable"; notes?: string | null;
};

export function useUpdateAsset() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & AssetPatch) => {
      const { data, error } = await supabase.from("assets").update(patch as never).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["assets", cid] });
      qc.invalidateQueries({ queryKey: ["asset", v.id] });
    },
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

/* ---------- MUTATION HELPERS ---------- */
function useCompanyMutation<TVars>(
  table: "maintenance" | "fuel_logs" | "expenses" | "damage_reports" | "documents" | "assignments",
  keys: string[],
  withCreatedBy = false,
) {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async (payload: TVars) => {
      if (!cid) throw new Error("No workspace selected");
      const extra: Record<string, unknown> = { company_id: cid };
      if (withCreatedBy) {
        const { data: u } = await supabase.auth.getUser();
        extra.created_by = u.user?.id;
      }
      const { data, error } = await supabase
        .from(table)
        .insert({ ...(payload as object), ...extra } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k, cid] })),
  });
}

export type MaintenanceInput = {
  asset_id: string; type: "scheduled" | "repair" | "inspection";
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduled_date?: string | null; completed_date?: string | null;
  cost?: number | null; odometer?: number | null; vendor?: string | null; description?: string | null;
};
export const useCreateMaintenance = () =>
  useCompanyMutation<MaintenanceInput>("maintenance", ["maintenance"], true);

export function useUpdateMaintenance() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & Partial<MaintenanceInput>) => {
      const { data, error } = await supabase.from("maintenance").update(patch as never).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance", cid] }),
  });
}

export type FuelInput = {
  asset_id: string; driver_id?: string | null; liters: number; cost: number;
  odometer?: number | null; station?: string | null; logged_at?: string;
};
export const useCreateFuelLog = () => useCompanyMutation<FuelInput>("fuel_logs", ["fuel"]);

export type ExpenseInput = {
  category: string; amount: number; expense_date: string;
  asset_id?: string | null; description?: string | null;
};
export const useCreateExpense = () => useCompanyMutation<ExpenseInput>("expenses", ["expenses"], true);

export type DamageInput = {
  asset_id: string; assignment_id?: string | null; description: string;
  severity: "low" | "medium" | "high" | "critical"; cost?: number | null; reported_at?: string;
};
export const useCreateDamageReport = () => useCompanyMutation<DamageInput>("damage_reports", ["damage"]);

export type DocumentInput = {
  name: string; kind: "registration" | "insurance" | "inspection" | "license" | "other";
  asset_id?: string | null; driver_id?: string | null; expiry_date?: string | null; storage_path?: string | null;
};
export const useCreateDocument = () => useCompanyMutation<DocumentInput>("documents", ["documents"], true);

/* ---------- DRIVER UPDATE ---------- */
export type DriverPatch = {
  full_name?: string; email?: string | null; phone?: string | null;
  license_number?: string | null; license_expiry?: string | null;
  status?: "active" | "suspended" | "inactive"; notes?: string | null;
};

export function useUpdateDriver() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async ({ id, ...patch }: { id: string } & DriverPatch) => {
      const { data, error } = await supabase.from("drivers").update(patch as never).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers", cid] }),
  });
}

/* ---------- GENERIC DELETE ---------- */
export type DeletableTable =
  | "assets" | "drivers" | "maintenance" | "fuel_logs" | "expenses" | "damage_reports" | "documents" | "assignments";

const TABLE_KEYS: Record<DeletableTable, string[]> = {
  assets: ["assets"],
  drivers: ["drivers"],
  maintenance: ["maintenance"],
  fuel_logs: ["fuel"],
  expenses: ["expenses"],
  damage_reports: ["damage"],
  documents: ["documents"],
  assignments: ["assignments", "assets"],
};

export function useDeleteRow(table: DeletableTable) {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => TABLE_KEYS[table].forEach((k) => qc.invalidateQueries({ queryKey: [k, cid] })),
  });
}

/* ---------- ASSIGNMENTS: handover / return ---------- */
export type AssignmentInput = {
  asset_id: string; driver_id: string; start_at?: string;
  checkout_odometer?: number | null; checkout_notes?: string | null; checkout_signature_url?: string | null;
};
export const useCreateAssignment = () =>
  useCompanyMutation<AssignmentInput>("assignments", ["assignments", "assets"], true);

export function useReturnAssignment() {
  const qc = useQueryClient();
  const cid = useCurrentCompanyId();
  return useMutation({
    mutationFn: async (vars: {
      id: string; checkin_odometer?: number | null; checkin_notes?: string | null;
      checkin_signature_url?: string | null;
    }) => {
      const { id, ...patch } = vars;
      const { data, error } = await supabase
        .from("assignments")
        .update({ ...patch, status: "returned", end_at: new Date().toISOString() } as never)
        .eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assignments", cid] });
      qc.invalidateQueries({ queryKey: ["assets", cid] });
    },
  });
}
