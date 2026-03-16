import { Link } from "react-router-dom";
import { Bell, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (mobile) {
    return (
      <>
        {user && (
          <Link to="/notificaciones" className="relative">
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-accent text-[9px] font-bold text-accent-foreground inline-flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        )}
        {user ? (
          <>
            <Link to="/perfil">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              aria-label="Cerrar sesion"
              title="Cerrar sesion"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <LogIn className="h-3.5 w-3.5" />
              Entrar
            </Button>
          </Link>
        )}
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Link to="/perfil" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Mi cuenta
        </Link>
        <Link to="/auth">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            Iniciar sesion
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link to="/perfil" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
        Perfil
      </Link>
      {(profile?.role === "provider" || profile?.role === "buyer") && (
        <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Dashboard
        </Link>
      )}
      {profile?.role === "provider" && (
        <Link to="/dashboard/leads" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
          Leads
        </Link>
      )}
      <Link to="/notificaciones" className="relative text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
        <Bell className="h-4 w-4" />
        Alertas
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-3 min-w-5 h-5 px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground inline-flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          {profile?.displayName || user.email?.split("@")[0]}
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5">
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </Button>
      </div>
    </>
  );
};

export default TopNavAuthActions;
