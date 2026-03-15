import { Navigate } from "react-router-dom";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile, useMyProviderProfile } from "@/hooks/use-profile-data";

const DashboardHomeRedirect = () => {
  const { isLoading: authLoading } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useMyProfile();
  const { data: providerProfile, isLoading: providerLoading } = useMyProviderProfile();

  if (authLoading || profileLoading || providerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-slate-400">Cargando dashboard...</p>
      </div>
    );
  }

  if (profile?.role === "provider") {
    if (!providerProfile) {
      return <Navigate to="/dashboard/proveedor/perfil" replace />;
    }
    return <Navigate to="/dashboard/proveedor" replace />;
  }

  return <Navigate to="/dashboard/cliente" replace />;
};

export default DashboardHomeRedirect;
