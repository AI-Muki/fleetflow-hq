import { describe, it, expect } from "vitest";
import { canSeePage, canManageTeam } from "./permissions";

describe("role permissions", () => {
  it("driver cannot see expenses", () => expect(canSeePage("driver", "/expenses")).toBe(false));
  it("driver can see fuel", () => expect(canSeePage("driver", "/fuel")).toBe(true));
  it("mechanic cannot see reports", () => expect(canSeePage("mechanic", "/reports")).toBe(false));
  it("accountant sees expenses", () => expect(canSeePage("accountant", "/expenses")).toBe(true));
  it("only owner/admin manage team", () => {
    expect(canManageTeam("owner")).toBe(true);
    expect(canManageTeam("manager")).toBe(false);
  });
});
