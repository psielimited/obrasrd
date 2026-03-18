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
          <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-lg border-[#E3DDD4] bg-transparent px-2.5 text-xs">
            <LogIn className="h-3.5 w-3.5" />
            Entrar
          </Button>
        </Link>
      );
    }
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-lg border-[#E3DDD4] bg-transparent px-3">
          <LogIn className="h-4 w-4" />
          Iniciar sesion
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
          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
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
        Cerrar sesion
      </DropdownMenuItem>
    </>
  );

  if (mobile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg border border-[#E3DDD4] bg-transparent hover:bg-[#F5F0E8]"
          >
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarFallback className="rounded-md bg-[#1A1612] text-[10px] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4773B] px-1 text-[9px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 border-[#E3DDD4]">
          {menuContent}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 gap-2 rounded-lg border border-[#E3DDD4] bg-transparent px-1.5 pr-2 hover:bg-[#F5F0E8]"
        >
          <Avatar className="h-7 w-7 rounded-md">
            <AvatarFallback className="rounded-md bg-[#1A1612] text-[10px] text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[96px] truncate text-[13px] font-medium text-[#1A1612] lg:inline">
            {displayName}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-[#7A6E64]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C4773B] px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-[#E3DDD4]">
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TopNavAuthActions;
