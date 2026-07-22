import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — FleetFlow" },
      { name: "description", content: "Sign in or create your FleetFlow account." },
      { property: "og:title", content: "Sign in — FleetFlow" },
      { property: "og:description", content: "Access your fleet workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 500);
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background p-10 border-r">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <Link to="/" className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="relative">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Fleet management,<br/> without the chaos.</h1>
          <p className="mt-3 max-w-md text-muted-foreground">One workspace for vehicles, drivers, maintenance, assignments, damages and expenses.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 max-w-md">
            {[["284","Assets"],["87","Health"],["4","Alerts"]].map(([v,l]) => (
              <div key={l} className="rounded-lg border bg-card/60 backdrop-blur p-3">
                <div className="text-2xl font-semibold tabular-nums">{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">© 2026 FleetFlow</p>
      </div>

      <div className="flex items-center justify-center p-6">
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:0.4}} className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center"><Zap className="h-4 w-4"/></div>
            <span className="font-semibold">FleetFlow</span>
          </div>
          <Card className="p-6">
            <Tabs defaultValue="signin">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-5">
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="e">Work email</Label>
                    <Input id="e" type="email" defaultValue="owner@acme.co" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p">Password</Label>
                    <Input id="p" type="password" defaultValue="demo-password" required />
                  </div>
                  <Button className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
                  <p className="text-center text-xs text-muted-foreground">Demo — auth wires to Lovable Cloud in Phase 2.</p>
                </form>
              </TabsContent>
              <TabsContent value="signup" className="mt-5">
                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="c">Company name</Label>
                    <Input id="c" placeholder="Acme Logistics" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="e2">Work email</Label>
                    <Input id="e2" type="email" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="p2">Password</Label>
                    <Input id="p2" type="password" required />
                  </div>
                  <Button className="w-full" disabled={loading}>{loading ? "Creating…" : "Create workspace"}</Button>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
