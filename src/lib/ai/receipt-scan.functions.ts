import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createResponsesCall } from "./responses";

export type ReceiptData = {
  kind: "fuel" | "expense";
  date: string | null;
  total: number | null;
  liters: number | null;
  station: string | null;
  category: string | null;
  description: string | null;
};

export const scanReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { image: string }) => {
    if (!input?.image?.startsWith("data:image/")) throw new Error("Invalid image");
    if (input.image.length > 8_000_000) throw new Error("Image too large");
    return input;
  })
  .handler(async ({ data }): Promise<ReceiptData> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured");

    const { result } = createResponsesCall(
      getRequest(),
      { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
      [
        {
          role: "user",
          content: [
            { type: "text", text: "Read this receipt and return only the JSON object." },
            { type: "image", image: data.image },
          ],
        },
      ],
      `You extract data from fuel and expense receipts (often Bosnian/Croatian/Serbian). Reply with ONLY a JSON object, no markdown:
{"kind":"fuel"|"expense","date":"YYYY-MM-DD"|null,"total":number|null,"liters":number|null,"station":string|null,"category":"tolls"|"parking"|"insurance"|"registration"|"tyres"|"cleaning"|"fines"|"other"|null,"description":string|null}
kind is "fuel" when the receipt is for fuel (diesel, benzin, eurodizel, LPG). total is the grand total paid. station is the merchant name.`,
    );

    const text = await result.text;
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not read the receipt");
    const p = JSON.parse(match[0]);
    const n = (v: unknown) => (typeof v === "number" && isFinite(v) ? v : typeof v === "string" && v.trim() !== "" && isFinite(Number(v.replace(",", "."))) ? Number(v.replace(",", ".")) : null);
    const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
    return {
      kind: p.kind === "fuel" ? "fuel" : "expense",
      date: typeof p.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(p.date) ? p.date : null,
      total: n(p.total),
      liters: n(p.liters),
      station: s(p.station),
      category: s(p.category),
      description: s(p.description),
    };
  });
