import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { CompanyProvider, useCompany } from "@/hooks/use-company";
import { useRouterState, Link } from "@tanstack/react-router";
import { canSeePage } from "@/lib/permissions";

function RoleGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const role = useCompany().current?.role;
  if (canSeePage(role, pathname)) return <Outlet />;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <h2 className="text-lg font-semibold">No access</h2>
      <p className="text-sm text-muted-foreground">Your role in this workspace can't open this page.</p>
      <Link to="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <div className="print:hidden contents"><AppSidebar /></div>
            <SidebarInset className="flex min-w-0 flex-1 flex-col">
              <div className="print:hidden contents"><AppTopbar /></div>
              <main className="flex-1 min-w-0">
                <RoleGate />
              </main>
            </SidebarInset>
          </div>
          <Toaster />
        </SidebarProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}
