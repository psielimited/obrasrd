import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { upsertMyProfile, type UserRole } from "@/lib/profile-api";
import {
  PROVIDER_SIGNUP_TYPE_OPTIONS,
  getProviderSignupTypeOption,
  type ProviderSignupType,
  storeProviderOnboardingDraft,
} from "@/lib/provider-onboarding";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("buyer");
  const [providerType, setProviderType] = useState<ProviderSignupType>("empresa");
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [signupStep, setSignupStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = (location.state as { from?: string } | undefined)?.from ?? "/dashboard";
  const isProviderSignup = mode === "signup" && signupRole === "provider";
  const totalSignupSteps = isProviderSignup ? 3 : 2;
  const selectedProviderType = useMemo(
    () => getProviderSignupTypeOption(providerType),
    [providerType],
  );
  const isAccountStepValid = Boolean(email.trim() && password.trim() && displayName.trim());
  const isProviderBasicsValid = Boolean(trade.trim() && city.trim());
  const canSubmitSignup =
    signupStep === 1
      ? true
      : signupStep === 2
        ? isAccountStepValid
        : isProviderBasicsValid;

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signup") {
      if (!canSubmitSignup) return;
      if (signupStep < totalSignupSteps) {
        setSignupStep((prev) => prev + 1);
        return;
      }
    } else if (!email.trim() || !password.trim()) {
      return;
    }

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
              signup_role: signupRole,
              provider_type: signupRole === "provider" ? providerType : undefined,
            },
          },
        });
        if (error) throw error;

        if (signupRole === "provider") {
          storeProviderOnboardingDraft({
            providerType,
            displayName: displayName.trim(),
            trade: trade.trim(),
            city: city.trim(),
            whatsapp: whatsapp.trim() || undefined,
          });

          trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.OnboardingCompleted, {
            source: "auth_signup",
            role: "provider",
            provider_type: providerType,
          });

          try {
            await upsertMyProfile({
              displayName: displayName.trim() || undefined,
              role: "provider",
              phone: whatsapp.trim() || undefined,
              notificationEmailEnabled: true,
              notificationWhatsappEnabled: Boolean(whatsapp.trim()),
            });
          } catch (profileError) {
            console.warn("No se pudo guardar el rol de proveedor al crear cuenta", profileError);
          }
        }
      }

      if (mode === "signup" && signupRole === "provider") {
        toast({
          title: "Cuenta creada",
          description: "Completa tu perfil inicial para publicar tu servicio.",
        });
        navigate("/dashboard/proveedor/perfil?onboarding=1");
      } else {
        navigate(redirectTo);
      }
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

  const resetSignupFlow = (nextMode: "signin" | "signup") => {
    setMode(nextMode);
    setSignupStep(1);
  };

  const continueFromTypeStep = () => {
    if (signupStep !== 1) return;
    if (signupRole === "provider") {
      trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.OnboardingStarted, {
        source: "auth_signup",
        role: "provider",
        provider_type: providerType,
        step: 1,
      });
    }
    setSignupStep(2);
  };

  const goBackSignupStep = () => {
    setSignupStep((prev) => Math.max(1, prev - 1));
  };

  const submitLabel =
    mode === "signin"
      ? "Iniciar sesion"
      : signupStep < totalSignupSteps
        ? "Continuar"
        : "Crear cuenta y continuar";

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="container max-w-md mx-auto bg-card p-6 rounded-xl obra-shadow space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {mode === "signin" ? "Iniciar sesion" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Accede a tu cuenta y panel personalizado."
              : "Crea tu acceso y completa lo minimo para empezar."}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant={mode === "signin" ? "default" : "outline"} className="flex-1" onClick={() => resetSignupFlow("signin")}>
            Entrar
          </Button>
          <Button variant={mode === "signup" ? "default" : "outline"} className="flex-1" onClick={() => resetSignupFlow("signup")}>
            Registrarme
          </Button>
        </div>

        {mode === "signup" && (
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Paso {signupStep} de {totalSignupSteps}</p>
            <p className="text-sm text-foreground mt-1">
              {signupStep === 1
                ? "Selecciona el tipo de cuenta"
                : signupStep === 2
                  ? "Crea tus credenciales de acceso"
                  : "Confirma tus datos iniciales de perfil"}
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          {mode === "signup" && signupStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tipo de cuenta</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupRole("buyer")}
                    className={`rounded-lg border p-3 text-left transition-colors ${signupRole === "buyer" ? "border-accent bg-accent/10" : "border-border bg-card"}`}
                  >
                    <p className="text-sm font-semibold text-foreground">Quiero contratar servicios</p>
                    <p className="text-xs text-muted-foreground mt-1">Accede al directorio y compara proveedores.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupRole("provider")}
                    className={`rounded-lg border p-3 text-left transition-colors ${signupRole === "provider" ? "border-accent bg-accent/10" : "border-border bg-card"}`}
                  >
                    <p className="text-sm font-semibold text-foreground">Quiero ofrecer servicios</p>
                    <p className="text-xs text-muted-foreground mt-1">Publica tu perfil y recibe contactos por WhatsApp.</p>
                  </button>
                </div>
              </div>

              {signupRole === "provider" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Tipo de proveedor</label>
                  <div className="grid grid-cols-1 gap-2">
                    {PROVIDER_SIGNUP_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setProviderType(option.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${providerType === option.id ? "border-accent bg-accent/10" : "border-border bg-card"}`}
                      >
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{option.helper}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button type="button" variant="accent" className="w-full" onClick={continueFromTypeStep}>
                Continuar
              </Button>
            </div>
          )}

          {mode === "signup" && signupStep === 2 && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {isProviderSignup ? selectedProviderType.businessNameLabel : "Nombre completo"}
                </label>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder={isProviderSignup ? selectedProviderType.businessNamePlaceholder : "Tu nombre"}
                  className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Correo de acceso</label>
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
                  placeholder="Minimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">Usa una contrasena segura para proteger tu cuenta.</p>
              </div>
            </>
          )}

          {mode === "signup" && signupStep === 3 && isProviderSignup && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {selectedProviderType.tradeLabel}
                </label>
                <input
                  value={trade}
                  onChange={(event) => setTrade(event.target.value)}
                  placeholder={selectedProviderType.tradePlaceholder}
                  className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  Ciudad base de operaciones
                </label>
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Ej: Santo Domingo"
                  className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  WhatsApp (opcional por ahora)
                </label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="Ej: 809-123-4567"
                  className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">Podras completar mas datos y portafolio en el siguiente paso.</p>
              </div>
            </>
          )}

          {mode === "signin" && (
            <>
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
            </>
          )}

          <div className="flex gap-2">
            {mode === "signup" && signupStep > 1 && (
              <Button type="button" variant="outline" className="flex-1" onClick={goBackSignupStep}>
                Atras
              </Button>
            )}
            {(mode === "signin" || signupStep > 1) && (
              <Button type="submit" variant="accent" className="flex-1" disabled={isSubmitting || !canSubmitSignup}>
                {isSubmitting ? "Procesando..." : submitLabel}
              </Button>
            )}
          </div>
        </form>

        {mode === "signin" && (
          <Button type="button" variant="outline" className="w-full" onClick={signInWithGoogle}>
            Continuar con Google
          </Button>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
