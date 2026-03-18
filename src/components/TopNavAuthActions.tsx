import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronDown, LayoutDashboard, LogIn, LogOut, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
          Iniciar sesión
        </Button>
      </Link>
    );
  }

  const menuContent = (
    <>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold leading-none">{displayName}</p>
          <p className="text-xs text-muted-foreground leading-none">{user.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => navigate("/perfil")}>
        <User className="mr-2 h-4 w-4" />
        Mi perfil
      </DropdownMenuItem>
      {(profile?.role === "provider" || profile?.role === "buyer") && (
        <DropdownMenuItem onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
      )}
      {profile?.role === "provider" && (
        <DropdownMenuItem onClick={() => navigate("/dashboard/leads")}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Leads
        </DropdownMenuItem>
      )}
      <DropdownMenuItem onClick={() => navigate("/notificaciones")}>
        <Bell className="mr-2 h-4 w-4" />
        Notificaciones
        {unreadCount > 0 && (
          <span className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-accent text-[10px] font-bold text-accent-foreground inline-flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        className="text-destructive focus:text-destructive focus:bg-destructive/10"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar sesión
      </DropdownMenuItem>
    </>
  );

  if (mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-accent text-accent-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground inline-flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-accent text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground inline-flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopNavAuthActions;
