import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMyProfile } from "@/hooks/use-profile-data";
import { upsertMyProfile, type UserRole } from "@/lib/profile-api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { profileQueryKeys } from "@/hooks/use-profile-data";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const { data: profile } = useMyProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [notificationEmailEnabled, setNotificationEmailEnabled] = useState(true);
  const [notificationWhatsappEnabled, setNotificationWhatsappEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName ?? "");
    setPhone(profile.phone ?? "");
    setRole(profile.role);
    setNotificationEmailEnabled(profile.notificationEmailEnabled);
    setNotificationWhatsappEnabled(profile.notificationWhatsappEnabled);
  }, [profile]);

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await upsertMyProfile({
        displayName: displayName.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        notificationEmailEnabled,
        notificationWhatsappEnabled,
      });
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.myProfile });
      toast({
        title: "Perfil actualizado",
        description: "Tus datos se guardaron correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo guardar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-card p-6 rounded-xl obra-shadow space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mi perfil</h1>
            <p className="text-sm text-muted-foreground mt-1">Configura tu cuenta y tipo de usuario.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nombre</label>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Telefono</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="809-000-0000"
              className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Rol</label>
            <div className="flex gap-2">
              <Button variant={role === "buyer" ? "default" : "outline"} onClick={() => setRole("buyer")}>
                Cliente
              </Button>
              <Button variant={role === "provider" ? "default" : "outline"} onClick={() => setRole("provider")}>
                Proveedor
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Notificaciones</label>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={notificationEmailEnabled ? "default" : "outline"}
                onClick={() => setNotificationEmailEnabled((prev) => !prev)}
              >
                Email
              </Button>
              <Button
                variant={notificationWhatsappEnabled ? "default" : "outline"}
                onClick={() => setNotificationWhatsappEnabled((prev) => !prev)}
              >
                WhatsApp
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Para WhatsApp usa un telefono valido en tu perfil.
            </p>
          </div>

          {role === "provider" && (
            <div className="bg-muted/40 p-4 rounded-lg flex flex-col gap-2">
              <p className="text-sm text-foreground">Tu cuenta esta configurada como proveedor.</p>
              <Link to="/dashboard/proveedor" className="text-sm font-semibold text-accent hover:underline">
                Ir al dashboard de proveedor
              </Link>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="accent" onClick={saveProfile} disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button variant="outline" onClick={signOut}>
              Cerrar sesion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
