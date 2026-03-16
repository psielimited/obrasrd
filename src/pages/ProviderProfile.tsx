import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, Calendar, Heart, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CategoryTag from "@/components/marketplace/CategoryTag";
import TrustBadgeRow from "@/components/marketplace/TrustBadgeRow";
import PortfolioGallery from "@/components/marketplace/PortfolioGallery";
import { useProvider, usePhases } from "@/hooks/use-marketplace-data";
import { createLead } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { toggleSavedProvider } from "@/lib/saved-providers-api";
import { savedProvidersQueryKeys, useMySavedProviderIds } from "@/hooks/use-saved-providers-data";
import { calculateProviderProfileCompleteness, getProviderTrustBadges } from "@/lib/provider-trust";

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: provider, isLoading } = useProvider(id);
  const { data: phases = [] } = usePhases();
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

  const categoryName = useMemo(() => {
    const phase = phases.find((item) => item.id === provider?.phaseId);
    return phase?.categories.find((item) => item.slug === provider?.categorySlug)?.name;
  }, [phases, provider?.categorySlug, provider?.phaseId]);

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
  const trustBadges = getProviderTrustBadges(provider, {
    profileCompleteness: calculateProviderProfileCompleteness(provider),
  });

  const submitLead = async () => {
    if (!canSubmitLead || isSubmittingLead) return;

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
        <div className="container max-w-5xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <section className="rounded-2xl border border-border bg-card p-6 obra-shadow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{provider.name}</h1>
                  <CategoryTag categorySlug={provider.categorySlug} categoryName={categoryName} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">{provider.trade}</p>
                <p className="text-sm text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {provider.city}
                </p>
              </div>
              {provider.startingPrice && (
                <Badge variant="outline" className="h-fit text-sm font-bold px-3 py-1.5">
                  Desde RD${provider.startingPrice.toLocaleString()}
                </Badge>
              )}
            </div>

            <div className="mt-3">
              <TrustBadgeRow badges={trustBadges} />
            </div>
          </section>

          <PortfolioGallery
            images={provider.portfolioImages}
            categorySlug={provider.categorySlug}
            categoryName={categoryName}
            trustBadges={trustBadges}
            emptyTitle="Este proveedor aun no ha subido evidencia visual"
            emptyDescription="Cuando publique imagenes de obra, podras evaluar mejor sus procesos y resultados."
          />

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 obra-shadow">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Descripcion</h2>
              <p className="text-sm text-foreground leading-relaxed">{provider.description}</p>

              <div className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Areas de servicio</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.serviceAreas.map((area) => (
                    <Badge key={area} variant="outline" className="font-medium">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
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

            <aside className="rounded-2xl border border-border bg-card p-5 obra-shadow h-fit">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Datos clave</h2>
              <div className="space-y-3 text-sm">
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {provider.yearsExperience} anos de experiencia
                </p>
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {provider.completedProjects} proyectos completados
                </p>
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Star className="h-4 w-4 text-accent" />
                  {provider.rating} ({provider.reviewCount} resenas)
                </p>
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {provider.serviceAreas.length} zonas de servicio
                </p>
              </div>
              <Button variant="whatsapp" className="w-full mt-4" onClick={() => window.open(whatsappUrl, "_blank")}>
                Escribir por WhatsApp
              </Button>
            </aside>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfile;
