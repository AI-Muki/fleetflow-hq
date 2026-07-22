import { Bell, Moon, Search, Sun, Plus, Check } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useCompany } from "@/hooks/use-company";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";

export function AppTopbar() {
  const { theme, toggle } = useTheme();
  const { user } = useAuth();
  const { companies, current, setCurrent } = useCompany();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const name = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "You";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <div className="relative ml-1 flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search plate, VIN, driver, invoice…"
          className="h-9 pl-9 pr-16 bg-muted/40 border-muted-foreground/10 focus-visible:bg-background"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button size="sm" className="hidden md:inline-flex gap-1.5">
          <Plus className="h-4 w-4" /> New
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm">{name}</span>
                <span className="text-xs font-normal text-muted-foreground truncate">
                  {current ? `${current.role.charAt(0).toUpperCase() + current.role.slice(1)} · ${current.company.name}` : user?.email}
                </span>
              </div>
            </DropdownMenuLabel>
            {companies.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Workspaces</DropdownMenuLabel>
                {companies.map((m) => (
                  <DropdownMenuItem key={m.company.id} onClick={() => setCurrent(m.company.id)}>
                    <span className="flex-1 truncate">{m.company.name}</span>
                    {current?.company.id === m.company.id && <Check className="h-3.5 w-3.5" />}
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={signOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
