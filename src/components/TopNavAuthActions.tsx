import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LayoutDashboard, LogIn, LogOut, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { useUnreadNotificationCount } from "@/hooks/use-notifications-data";

interface TopNavAuthActionsProps {
  mobile?: boolean;
}

const TopNavAuthActions = ({ mobile = false }: TopNavAuthActionsProps) => {
  const { user } = useAuthSession();
  const { data: profile } = useMyProfile();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const displayName = profile?.displayName || user?.email?.split("@")[0] || "";
  const initials = displayName.slice(0, 2).toUpperCase();

  if (!user) {
    if (mobile) {
      return (
        <Link to="/auth">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <LogIn className="h-3.5 w-3.5" />
            Entrar
          </Button>
        </Link>
      );
    }
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="gap-2">
          <LogIn className="h-4 w-4" />
          Iniciar sesion
        </Button>
      </Link>
    );
  }

  const menuContent = (
    <>
      <div className="flex items-center gap-3 border-b border-border px-3 py-3">
        <Avatar className="h-8 w-8 rounded-lg flex-shrink-0">
          <AvatarFallback className="rounded-lg bg-foreground text-[11px] font-bold text-background">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-none truncate">{displayName}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[9px] text-muted-foreground uppercase tracking-wide">Activo</span>
        </div>
      </div>

      <div className="p-1.5">
        <DropdownMenuItem onClick={() => navigate("/perfil")} className="rounded-lg gap-2.5 py-2">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <User className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">Mi perfil</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Editar informacion publica</p>
          </div>
        </DropdownMenuItem>

        {(profile?.role === "provider" || profile?.role === "buyer") && (
          <DropdownMenuItem onClick={() => navigate("/dashboard")} className="rounded-lg gap-2.5 py-2">
            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">Dashboard</span>
          </DropdownMenuItem>
        )}

        {profile?.role === "provider" && (
          <DropdownMenuItem onClick={() => navigate("/dashboard/leads")} className="rounded-lg gap-2.5 py-2">
            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">Leads</span>
            {unreadCount > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => navigate("/notificaciones")} className="rounded-lg gap-2.5 py-2">
          <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            <Bell className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">Notificaciones</span>
          {unreadCount > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-foreground text-background px-1.5 py-0.5 rounded">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </DropdownMenuItem>
      </div>

      <DropdownMenuSeparator />

      <div className="p-1.5">
        <DropdownMenuItem
          onClick={handleSignOut}
          className="rounded-lg gap-2.5 py-2 text-destructive focus:text-destructive focus:bg-destructive/8"
        >
          <div className="w-6 h-6 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <LogOut className="h-3.5 w-3.5 text-destructive" />
          </div>
          <span className="text-sm font-medium">Cerrar sesion</span>
        </DropdownMenuItem>
      </div>
    </>
  );

  if (mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative h-9 w-9">
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarFallback className="rounded-md bg-foreground text-[10px] text-background">
                {initials}
              </AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative h-9 gap-2 px-1.5 pr-2">
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarFallback className="rounded-md bg-foreground text-[10px] text-background">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[96px] truncate text-[13px] font-medium lg:inline">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopNavAuthActions;
