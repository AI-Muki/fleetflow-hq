import { createFileRoute } from "@tanstack/react-router";
import { PageBody, PageHeader } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — FleetFlow" }] }),
  component: SettingsPage,
});

const members = [
  { n: "Ana Kovač", r: "Company Owner", e: "ana@acme.co" },
  { n: "Peter Schmidt", r: "Fleet Manager", e: "peter@acme.co" },
  { n: "Ivana Marković", r: "Accountant", e: "ivana@acme.co" },
  { n: "Luigi Ferrari", r: "Mechanic", e: "luigi@acme.co" },
];

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Company, team, roles, notifications." />
      <PageBody>
        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="team">Team & roles</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold mb-4">Company profile</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name" defaultValue="Acme Logistics" />
                <Field label="VAT ID" defaultValue="EU-12345678" />
                <Field label="Phone" defaultValue="+385 1 555 0110" />
                <Field label="Email" defaultValue="ops@acme.co" />
                <Field label="Timezone" defaultValue="Europe/Zagreb" />
                <Field label="Language" defaultValue="English" />
                <div className="sm:col-span-2"><Field label="Address" defaultValue="Ilica 10, 10000 Zagreb, Croatia" /></div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button>Save changes</Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Team members</h3>
                <Button size="sm">Invite user</Button>
              </div>
              <div className="divide-y">
                {members.map(m => (
                  <div key={m.e} className="flex items-center gap-3 py-3">
                    <Avatar><AvatarFallback className="bg-primary/10 text-primary text-xs">{m.n.split(" ").map(x=>x[0]).join("")}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{m.n}</div>
                      <div className="text-xs text-muted-foreground">{m.e}</div>
                    </div>
                    <Badge variant="outline">{m.r}</Badge>
                    <Button size="sm" variant="ghost">Manage</Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold mb-4">Reminder schedule</h3>
              <div className="space-y-3">
                {["90 days before","60 days","30 days","15 days","7 days","3 days","1 day","On expiration","After expiration"].map((r, i) => (
                  <div key={r} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="text-sm font-medium">{r}</div>
                      <div className="text-xs text-muted-foreground">Dashboard · Email</div>
                    </div>
                    <Switch defaultChecked={i < 5} />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-4">
            <Card className="p-6 max-w-2xl">
              <h3 className="text-sm font-semibold">Current plan</h3>
              <div className="mt-3 flex items-center justify-between rounded-lg border p-4 bg-gradient-to-br from-primary/5 to-transparent">
                <div>
                  <div className="text-lg font-semibold">Business</div>
                  <div className="text-xs text-muted-foreground">Up to 500 assets · unlimited drivers</div>
                </div>
                <Button>Upgrade</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} />
    </div>
  );
}
