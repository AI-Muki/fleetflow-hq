export type Role = "admin" | "owner" | "manager" | "mechanic" | "driver" | "accountant";

/** Pages hidden per role. Roles not listed see everything. */
const HIDDEN: Partial<Record<Role, string[]>> = {
  driver: ["/drivers", "/maintenance", "/expenses", "/reports"],
  mechanic: ["/expenses", "/reports"],
};

export function canSeePage(role: Role | undefined | null, path: string): boolean {
  if (!role) return true;
  const hidden = HIDDEN[role] ?? [];
  return !hidden.some((p) => path === p || path.startsWith(p + "/"));
}

export const canManageTeam = (role?: Role | null) => role === "owner" || role === "admin";

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  manager: "Fleet manager",
  mechanic: "Mechanic",
  driver: "Driver",
  accountant: "Accountant",
};
