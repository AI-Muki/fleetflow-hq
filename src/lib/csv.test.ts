import { describe, expect, it } from "vitest";
import { parseCSV, parseCSVObjects } from "./csv";

describe("parseCSV", () => {
  it("parses simple rows", () => {
    expect(parseCSV("a,b,c\n1,2,3")).toEqual([
      ["a", "b", "c"],
      ["1", "2", "3"],
    ]);
  });

  it("handles quoted fields with commas and semicolons", () => {
    expect(parseCSV('name,note\n"Van, #12","paid; done"')).toEqual([
      ["name", "note"],
      ["Van, #12", "paid; done"],
    ]);
  });

  it("handles escaped quotes and CRLF", () => {
    expect(parseCSV('a\r\n"he said ""hi"""')).toEqual([["a"], ['he said "hi"']]);
  });

  it("skips empty lines and strips BOM", () => {
    expect(parseCSV("﻿a,b\n\n1,2\n")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("parseCSVObjects", () => {
  it("maps rows by normalized headers", () => {
    const objs = parseCSVObjects("Full Name,License Expiry\nAmir Hodžić,2027-01-01");
    expect(objs).toEqual([{ full_name: "Amir Hodžić", license_expiry: "2027-01-01" }]);
  });

  it("returns empty array when only headers exist", () => {
    expect(parseCSVObjects("a,b")).toEqual([]);
  });
});
