import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | undefined)?.from ?? "/dashboard";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || undefined,
            },
          },
        });
        if (error) throw error;
      }

      navigate(redirectTo);
    } catch (error) {
      toast({
        title: "No se pudo completar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithGoogle = async () => {
    await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + redirectTo,
    });
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="container max-w-md mx-auto bg-card p-6 rounded-xl obra-shadow space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "signin" ? "Iniciar sesion" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Accede a tu cuenta y panel personalizado.</p>
        </div>

        <div className="flex gap-2">
          <Button variant={mode === "signin" ? "default" : "outline"} className="flex-1" onClick={() => setMode("signin")}>
            Entrar
          </Button>
          <Button variant={mode === "signup" ? "default" : "outline"} className="flex-1" onClick={() => setMode("signup")}>
            Registrarme
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nombre</label>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <Button type="submit" variant="accent" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Procesando..." : mode === "signin" ? "Iniciar sesion" : "Crear cuenta"}
          </Button>
        </form>

        <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
          Continuar con Google
        </Button>
      </div>
    </div>
  );
};

export default AuthPage;
