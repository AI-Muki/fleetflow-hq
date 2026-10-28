/** Minimal CSV parser: handles quoted fields, commas/semicolons inside quotes, CRLF. */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === "," || c === ";") {
      row.push(field.trim());
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field.trim());
      field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  row.push(field.trim());
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

/** Parse CSV text into objects keyed by normalized header names. */
export function parseCSVObjects(text: string): Record<string, string>[] {
  const rows = parseCSV(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
  return rows.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] ?? "";
    });
    return obj;
  });
}
