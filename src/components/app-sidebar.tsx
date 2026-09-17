import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Truck, Users, ClipboardCheck, Wrench, AlertTriangle,
  Fuel, Receipt, FileText, Calendar, BarChart3, Settings, Zap,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const groups: { label: string; items: { title: string; url: string; icon: any; badge?: string }[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Calendar", url: "/calendar", icon: Calendar },
    ],
  },
  {
    label: "Fleet",
    items: [
      { title: "Assets", url: "/assets", icon: Truck },
      { title: "Drivers", url: "/drivers", icon: Users },
      { title: "Assignments", url: "/assignments", icon: ClipboardCheck },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Maintenance", url: "/maintenance", icon: Wrench },
      { title: "Damage Reports", url: "/damage-reports", icon: AlertTriangle },
      { title: "Fuel", url: "/fuel", icon: Fuel },
      { title: "Expenses", url: "/expenses", icon: Receipt },
      { title: "Documents", url: "/documents", icon: FileText },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports", url: "/reports", icon: BarChart3 },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">FleetFlow</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Enterprise</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => {
                  const active = pathname === item.url || pathname.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="flex-1">{item.title}</span>}
                          {!collapsed && item.badge && (
                            <span className="ml-auto rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t">
        {!collapsed ? (
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 to-transparent p-3">
            <p className="text-xs font-medium">Fleet Health</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-2xl font-semibold tabular-nums">87</span>
              <span className="text-[11px] text-success">+2 this week</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "87%" }} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">87</div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
