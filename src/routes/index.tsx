import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Truck, Wrench, ShieldCheck, BarChart3, Fuel, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FleetFlow — Modern fleet, asset & driver management" },
      { name: "description", content: "The enterprise-grade platform for fleet, asset, maintenance and driver management. Built for companies with hundreds or thousands of vehicles." },
      { property: "og:title", content: "FleetFlow — Modern fleet & asset management" },
      { property: "og:description", content: "Manage vehicles, drivers, assignments, maintenance and expenses in one calm, powerful workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold tracking-tight">FleetFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#modules" className="hover:text-foreground">Modules</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth"><Button variant="ghost" size="sm">Sign in</Button></Link>
          <Link to="/dashboard"><Button size="sm" className="gap-1.5">Launch app <ArrowRight className="h-3.5 w-3.5" /></Button></Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-primary/20 blur-3xl opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            Now with AI document extraction
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.6 }}
            className="mx-auto mt-6 max-w-3xl text-5xl md:text-6xl font-semibold tracking-tight"
          >
            Fleet management, without the chaos.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground"
          >
            One workspace for vehicles, drivers, maintenance, assignments, damages and expenses —
            purpose-built for companies with hundreds or thousands of assets.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            <Link to="/dashboard"><Button size="lg" className="gap-2 h-11 px-6">Launch dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link to="/auth"><Button size="lg" variant="outline" className="h-11 px-6">Create account</Button></Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7 }}
            className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10"
          >
            <div className="flex items-center gap-1.5 border-b px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
              <span className="ml-3 text-xs text-muted-foreground">app.fleetflow.com/dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-3 p-4 bg-muted/30">
              {[
                { l: "Total Assets", v: "284" },
                { l: "Active", v: "241", tone: "text-success" },
                { l: "In Service", v: "18", tone: "text-warning" },
                { l: "Out of Service", v: "6", tone: "text-destructive" },
              ].map((k) => (
                <div key={k.l} className="rounded-lg border bg-card p-3 text-left">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</div>
                  <div className={`mt-1 text-2xl font-semibold tabular-nums ${k.tone ?? ""}`}>{k.v}</div>
                </div>
              ))}
              <div className="col-span-3 h-40 rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Monthly expenses</div>
                <svg viewBox="0 0 300 100" className="mt-2 h-28 w-full">
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 80 L30 60 L60 65 L90 40 L120 55 L150 30 L180 45 L210 20 L240 35 L270 15 L300 25 L300 100 L0 100 Z" fill="url(#g)" />
                  <path d="M0 80 L30 60 L60 65 L90 40 L120 55 L150 30 L180 45 L210 20 L240 35 L270 15 L300 25" fill="none" stroke="var(--color-primary)" strokeWidth="2" />
                </svg>
              </div>
              <div className="rounded-lg border bg-card p-3">
                <div className="text-xs text-muted-foreground">Health score</div>
                <div className="mt-4 text-4xl font-semibold text-primary">87</div>
                <div className="mt-1 text-[10px] text-success">↑ +2 vs last week</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Everything your fleet needs.</h2>
          <p className="mt-3 text-muted-foreground">From a single truck to a mixed fleet of thousands. Assets, drivers, maintenance, expenses and compliance — connected.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Truck, title: "Any asset, any category", body: "Cars, vans, trucks, buses, forklifts, excavators, trailers, generators — unlimited categories with custom fields." },
            { icon: Wrench, title: "Maintenance on autopilot", body: "Schedule by mileage, engine hours or date. Whichever comes first. Never miss a service again." },
            { icon: ShieldCheck, title: "Digital handover & damage", body: "Photo-based check-in/out, digital signature, side-by-side before/after with automatic damage reports." },
            { icon: Fuel, title: "Fuel & expense intelligence", body: "Log fuel and expenses. See cost per km, per vehicle, per driver — down to the toll booth." },
            { icon: BarChart3, title: "Reports that ship", body: "Fleet cost, utilization, upcoming expirations, overdue maintenance. Export to PDF, Excel, CSV." },
            { icon: Zap, title: "AI that actually helps", body: "Snap a registration or invoice — FleetFlow extracts the data and files it correctly." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04 }}
              className="kpi-card p-6"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to see your fleet, clearly?</h2>
          <p className="mt-3 text-muted-foreground">Launch the demo workspace — no signup required.</p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button size="lg" className="h-11 px-6 gap-2">Open FleetFlow <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 FleetFlow. Built for real fleets.</span>
          <span>Made with care.</span>
        </div>
      </footer>
    </div>
  );
}
