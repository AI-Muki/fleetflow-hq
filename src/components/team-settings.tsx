import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/use-company";
import { canManageTeam, ROLE_LABELS, type Role } from "@/lib/permissions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = Object.keys(ROLE_LABELS) as Role[];

export function TeamSettings() {
  const { current } = useCompany();
  const cid = current?.company.id;
  const isAdmin = canManageTeam(current?.role);
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("driver");

  const members = useQuery({
    enabled: !!cid,
    queryKey: ["members", cid],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("company_member_list", { _company_id: cid! });
      if (error) throw error;
      return data ?? [];
    },
  });
  const invites = useQuery({
    enabled: !!cid && isAdmin,
    queryKey: ["invites", cid],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_invitations")
        .select("*").eq("company_id", cid!).is("accepted_at", null).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["members", cid] }); qc.invalidateQueries({ queryKey: ["invites", cid] }); };

  const invite = useMutation({
    mutationFn: async () => {
      const e = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(e)) throw new Error("Enter a valid email");
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("company_invitations")
        .upsert({ company_id: cid!, email: e, role, invited_by: u.user?.id, accepted_at: null }, { onConflict: "company_id,email" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Invitation saved — they join when they sign up or sign in with that email"); setEmail(""); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const { error } = await supabase.from("company_members").update({ role }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Role updated"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("company_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Member removed"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancelInvite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("company_invitations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return (
    <div className="space-y-4">
      {isAdmin && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3">Invite a team member</h3>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger className="sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={() => invite.mutate()} disabled={invite.isPending}>Invite</Button>
          </div>
          {!!invites.data?.length && (
            <div className="mt-4 divide-y">
              {invites.data.map((i) => (
                <div key={i.id} className="flex items-center gap-3 py-2 text-sm">
                  <span className="flex-1">{i.email}</span>
                  <Badge variant="secondary">Pending · {ROLE_LABELS[i.role as Role]}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => cancelInvite.mutate(i.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Team members</h3>
        <div className="divide-y">
          {(members.data ?? []).map((m) => {
            const name = m.full_name || m.email || "Member";
            return (
              <div key={m.member_id} className="flex items-center gap-3 py-3">
                <Avatar><AvatarFallback className="bg-primary/10 text-primary text-xs">{name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{name}</div>
                  <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                </div>
                {isAdmin && m.role !== "owner" ? (
                  <>
                    <Select value={m.role} onValueChange={(v) => changeRole.mutate({ id: m.member_id, role: v as Role })}>
                      <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{ROLES.filter((r) => r !== "owner").map((r) => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button size="icon" variant="ghost" onClick={() => removeMember.mutate(m.member_id)}><Trash2 className="h-4 w-4" /></Button>
                  </>
                ) : (
                  <Badge variant="outline">{ROLE_LABELS[m.role as Role]}</Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
