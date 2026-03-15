import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, Calendar, Heart } from "lucide-react";
import { useProvider } from "@/hooks/use-marketplace-data";
import { createLead } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { toggleSavedProvider } from "@/lib/saved-providers-api";
import { savedProvidersQueryKeys, useMySavedProviderIds } from "@/hooks/use-saved-providers-data";
import { useQueryClient } from "@tanstack/react-query";

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: provider, isLoading } = useProvider(id);
  const { user } = useAuthSession();
  const { data: profile } = useMyProfile();
  const { data: savedProviderIds = [] } = useMySavedProviderIds();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [requesterContact, setRequesterContact] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  useEffect(() => {
    if (!profile && !user) return;

    if (!requesterName.trim()) {
      setRequesterName(profile?.displayName || user?.email?.split("@")[0] || "");
    }
  }, [profile, user, requesterName]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando proveedor...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Proveedor no encontrado.</p>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
    `Hola, me interesa cotizar sus servicios de ${provider.trade}. Vi su perfil en ObrasRD.`,
  )}`;

  const canSubmitLead = requesterContact.trim() && message.trim();
  const isSaved = savedProviderIds.includes(provider.id);

  const submitLead = async () => {
    if (!canSubmitLead || isSubmittingLead) {
      return;
    }

    setIsSubmittingLead(true);
    try {
      await createLead({
        providerId: provider.id,
        requesterName: requesterName.trim() || undefined,
        requesterContact: requesterContact.trim(),
        estimatedBudget: estimatedBudget.trim() || undefined,
        message: message.trim(),
      });

      toast({
        title: "Solicitud enviada",
        description: "Tu solicitud de cotizacion fue enviada al proveedor.",
      });

      setShowQuoteForm(false);
      setEstimatedBudget("");
      setMessage("");
    } catch (error) {
      toast({
        title: "No se pudo enviar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const onToggleSave = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/proveedor/${provider.id}` } });
      return;
    }

    try {
      const saved = await toggleSavedProvider(provider.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.ids }),
        queryClient.invalidateQueries({ queryKey: savedProvidersQueryKeys.list }),
      ]);

      toast({
        title: saved ? "Proveedor guardado" : "Proveedor removido",
        description: saved ? "Lo agregamos a tus guardados." : "Se elimino de tus guardados.",
      });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      <div className="px-4 py-6">
        <div className="container max-w-3xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="bg-card p-6 rounded-xl obra-shadow mb-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-foreground">{provider.name}</h1>
                  {provider.verified && <CheckCircle className="h-4 w-4 text-accent" />}
                </div>
                <p className="text-sm text-muted-foreground">{provider.trade}</p>
              </div>
              {provider.startingPrice && (
                <span className="bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm font-bold font-tabular">
                  Desde RD${provider.startingPrice.toLocaleString()}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {provider.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-accent" />
                {provider.rating} ({provider.reviewCount} resenas)
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {provider.completedProjects} proyectos
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {provider.yearsExperience} anos exp.
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed mb-4">{provider.description}</p>

            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Areas de servicio</h3>
              <div className="flex flex-wrap gap-2">
                {provider.serviceAreas.map((area) => (
                  <span key={area} className="text-xs font-semibold px-2 py-1 bg-muted rounded text-muted-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="whatsapp" size="lg" className="flex-1" onClick={() => window.open(whatsappUrl, "_blank")}>
                Contactar por WhatsApp
              </Button>
              <div className="flex gap-2">
                <Button variant="accent" size="lg" className="flex-1" onClick={() => setShowQuoteForm((prev) => !prev)}>
                  Solicitar cotizacion
                </Button>
                <Button variant={isSaved ? "default" : "outline"} size="lg" onClick={onToggleSave} className="shrink-0">
                  <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                </Button>
              </div>
            </div>

            {showQuoteForm && (
              <div className="mt-4 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
                <p className="text-sm font-semibold text-foreground">Enviar solicitud de cotizacion</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    value={requesterName}
                    onChange={(event) => setRequesterName(event.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                  <input
                    value={requesterContact}
                    onChange={(event) => setRequesterContact(event.target.value)}
                    placeholder="Telefono o WhatsApp"
                    className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent text-sm"
                  />
                </div>

                <input
                  value={estimatedBudget}
                  onChange={(event) => setEstimatedBudget(event.target.value)}
                  placeholder="Presupuesto estimado (opcional)"
                  className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent text-sm"
                />

                <textarea
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Describe brevemente lo que necesitas"
                  className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                />

                <div className="flex gap-2">
                  <Button variant="accent" size="sm" onClick={submitLead} disabled={!canSubmitLead || isSubmittingLead}>
                    {isSubmittingLead ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowQuoteForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-card p-6 rounded-xl obra-shadow">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Resenas ({provider.reviewCount})
            </h2>
            <div className="space-y-4">
              {[
                { name: "Juan R.", rating: 5, text: "Excelente trabajo, muy profesional y puntual." },
                { name: "Ana M.", rating: 4, text: "Buen servicio, lo recomiendo para proyectos residenciales." },
              ].map((review, i) => (
                <div key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">{review.name}</span>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 text-accent fill-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
