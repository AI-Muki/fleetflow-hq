import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createResponsesCall } from "./responses";

const DAY = 24 * 60 * 60 * 1000;

export const getFleetSummary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { companyId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const cid = data.companyId;

    const [assets, drivers, maintenance, fuel, expenses, documents, damage] =
      await Promise.all([
        supabase.from("assets").select("id, name, plate, status, odometer").eq("company_id", cid),
        supabase.from("drivers").select("id, full_name, status, license_expiry").eq("company_id", cid),
        supabase.from("maintenance").select("id, type, status, scheduled_date, cost").eq("company_id", cid),
        supabase.from("fuel_logs").select("id, liters, cost, logged_at").eq("company_id", cid),
        supabase.from("expenses").select("id, category, amount, expense_date").eq("company_id", cid),
        supabase.from("documents").select("id, kind, name, expiry_date").eq("company_id", cid),
        supabase.from("damage_reports").select("id, severity, resolved_at, cost").eq("company_id", cid),
      ]);

    const now = Date.now();
    const in30 = now + 30 * DAY;
    const expiringDocs = (documents.data ?? []).filter(
      (d) => d.expiry_date && new Date(d.expiry_date).getTime() < in30,
    );
    const expiringLicenses = (drivers.data ?? []).filter(
      (d) => d.license_expiry && new Date(d.license_expiry).getTime() < in30,
    );
    const monthAgo = new Date(now - 30 * DAY).toISOString();
    const fuel30 = (fuel.data ?? []).filter((f) => f.logged_at >= monthAgo);
    const exp30 = (expenses.data ?? []).filter((e) => e.expense_date >= monthAgo.slice(0, 10));
    const maintCost30 = (maintenance.data ?? [])
      .filter((m) => m.status === "completed")
      .reduce((s, m) => s + Number(m.cost ?? 0), 0);

    const digest = {
      vehicles: {
        total: assets.data?.length ?? 0,
        active: (assets.data ?? []).filter((a) => a.status === "active").length,
        in_maintenance: (assets.data ?? []).filter((a) => a.status === "in_maintenance").length,
      },
      drivers: {
        total: drivers.data?.length ?? 0,
        active: (drivers.data ?? []).filter((d) => d.status === "active").length,
        licenses_expiring_30d: expiringLicenses.length,
      },
      documents_expiring_30d: expiringDocs.map((d) => `${d.kind}: ${d.name} (${d.expiry_date})`),
      maintenance: {
        scheduled: (maintenance.data ?? []).filter((m) => m.status === "scheduled").length,
        in_progress: (maintenance.data ?? []).filter((m) => m.status === "in_progress").length,
        completed_cost_total: Math.round(maintCost30 * 100) / 100,
      },
      last_30_days: {
        fuel_liters: Math.round(fuel30.reduce((s, f) => s + Number(f.liters), 0) * 10) / 10,
        fuel_cost: Math.round(fuel30.reduce((s, f) => s + Number(f.cost), 0) * 100) / 100,
        other_expenses: Math.round(exp30.reduce((s, e) => s + Number(e.amount), 0) * 100) / 100,
      },
      open_damage_reports: (damage.data ?? []).filter((d) => !d.resolved_at).length,
    };

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const { result } = createResponsesCall(
      getRequest(),
      {
        baseURL: "https://ai.gateway.lovable.dev/v1",
        apiKey,
        model: "openai/gpt-6-astra",
      },
      [
        {
          role: "user",
          content: `Here is the current fleet data as JSON:\n${JSON.stringify(digest, null, 2)}`,
        },
      ],
      "You are a fleet management analyst. Write a concise fleet health summary in the same language as the user's app (Bosnian/Croatian/Serbian). Use short sections with bullet points: overall status, urgent items (expiring documents/licenses, open damage), cost overview for the last 30 days, and 2-3 concrete recommendations. Be direct and practical. Max 250 words. Write plain text only — no markdown symbols like #, **, or -; use short section titles followed by a colon and plain sentences.",
    );

    const summary = await result.text;
    return { summary, digest };
  });
