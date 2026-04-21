import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { createServicePost, usePhases } from "@/hooks/use-marketplace-data";
import { useToast } from "@/hooks/use-toast";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { useAuthSession } from "@/hooks/use-auth-session";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { deriveProvinceFromText } from "@/lib/analytics/province";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { PUBLIC_ROUTES } from "@/lib/public-ia";

const PublishService = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuthSession();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postType, setPostType] = useState("Ofrezco servicios");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedBudget, setEstimatedBudget] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [requestedStageId, setRequestedStageId] = useState<number | undefined>(undefined);
  const [requestedDisciplineId, setRequestedDisciplineId] = useState<number | undefined>(undefined);
  const [requestedServiceId, setRequestedServiceId] = useState<number | undefined>(undefined);
  const [requestedWorkTypeId, setRequestedWorkTypeId] = useState<number | undefined>(undefined);
  const { data: taxonomyCatalog } = useTaxonomyCatalog();
  const { data: phases = [] } = usePhases();

  const isValid = title.trim() && location.trim() && description.trim() && whatsapp.trim();
  const filteredDisciplines = (taxonomyCatalog?.disciplines ?? []).filter((item) =>
    requestedStageId ? item.stageId === requestedStageId : true,
  );
  const filteredServices = (taxonomyCatalog?.services ?? []).filter((item) => {
    if (requestedStageId && item.stageId !== requestedStageId) return false;
    if (requestedDisciplineId && item.disciplineId !== requestedDisciplineId) return false;
    return true;
  });

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    if (authLoading) {
      return;
    }

    if (!user) {
      toast({
        title: "Inicia sesion para publicar",
        description: "Necesitas una cuenta activa para crear esta publicacion.",
        variant: "destructive",
      });
      navigate("/auth", { state: { from: routeLocation.pathname || PUBLIC_ROUTES.empresas } });
      return;
    }

    setIsSubmitting(true);
    try {
      await createServicePost({
        postType,
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        estimatedBudget: estimatedBudget.trim(),
        whatsapp: whatsapp.trim(),
        requestedStageId,
        requestedDisciplineId,
        requestedServiceId,
        requestedWorkTypeId,
      });
      trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ProjectRequestCreated, {
        source: "publish_service",
        provider_count: 0,
        success_count: 1,
        failed_count: 0,
        stage_id: requestedStageId,
        discipline_id: requestedDisciplineId,
        service_id: requestedServiceId,
        work_type_id: requestedWorkTypeId,
        province: deriveProvinceFromText(location),
      });
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "No se pudo publicar",
        description: error instanceof Error ? error.message : "Intenta nuevamente en unos minutos.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pb-16 md:pb-0 flex items-center justify-center px-4">
        <div className="bg-card p-8 rounded-xl obra-shadow text-center max-w-md">
          <h2 className="text-xl font-bold text-foreground mb-2">Solicitud enviada</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Tu publicacion sera revisada y aparecera en el marketplace pronto.
          </p>
          <Button variant="accent" onClick={() => navigate("/")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-6">
        <div className="container max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">Empresas y profesionales: activa captacion en ObrasRD</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Este espacio convierte tu operacion en una ficha comercial visible para clientes que buscan servicios de construccion en Republica Dominicana.
          </p>

          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Por que unirte como proveedor</p>
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="font-semibold text-foreground">Visibilidad por categoria y etapa</p>
                <p className="mt-1">Aparece donde el cliente filtra por disciplina, servicio y ciudad.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="font-semibold text-foreground">Leads con intencion real</p>
                <p className="mt-1">Recibes solicitudes con contexto operativo y contacto directo por WhatsApp.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="font-semibold text-foreground">Vitrina de proyectos</p>
                <p className="mt-1">Publica ejecuciones reales para respaldar capacidad tecnica y cierre comercial.</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
                <p className="font-semibold text-foreground">Confianza de plataforma</p>
                <p className="mt-1">Un perfil completo mejora senales de credibilidad frente a clientes y compras.</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Como se traduce en trabajo</p>
            <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li><span className="font-semibold text-foreground">1.</span> Publicas una oferta clara con categoria, ubicacion y alcance.</li>
              <li><span className="font-semibold text-foreground">2.</span> Tu perfil entra al flujo de descubrimiento y comparacion del directorio.</li>
              <li><span className="font-semibold text-foreground">3.</span> El cliente contacta por WhatsApp o solicitud guiada segun necesidad.</li>
              <li><span className="font-semibold text-foreground">4.</span> Actualizas portafolio y cobertura para mantener traccion por categoria.</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Tipo de publicacion
              </label>
              <select
                value={postType}
                onChange={(event) => setPostType(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Ofrezco servicios</option>
                <option>Vendo materiales</option>
                <option>Necesito un profesional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Titulo
              </label>
              <input
                type="text"
                placeholder="Ej: Empresa de impermeabilizacion para proyectos residenciales en Santo Domingo"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Ubicacion
              </label>
              <input
                type="text"
                placeholder="Ej: Santo Domingo"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Descripcion
              </label>
              <textarea
                rows={4}
                placeholder="Incluye tipo de obra, alcance, zonas que atiendes, tiempos de respuesta y evidencia de ejecucion."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Etapa del proyecto (opcional)
              </label>
              <select
                value={requestedStageId ? String(requestedStageId) : ""}
                onChange={(event) => {
                  const next = event.target.value ? Number(event.target.value) : undefined;
                  setRequestedStageId(next);
                  setRequestedDisciplineId(undefined);
                  setRequestedServiceId(undefined);
                  if (next) {
                    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.StageSelected, {
                      source: "publish_service",
                      stage_id: next,
                    });
                  }
                  trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
                    source: "publish_service",
                    filter_name: "etapa",
                    has_value: Boolean(next),
                    stage_id: next,
                  });
                }}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Sin especificar</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={String(phase.id)}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Disciplina tecnica (opcional)
              </label>
              <select
                value={requestedDisciplineId ? String(requestedDisciplineId) : ""}
                onChange={(event) => {
                  const next = event.target.value ? Number(event.target.value) : undefined;
                  setRequestedDisciplineId(next);
                  setRequestedServiceId(undefined);
                  const selected = filteredDisciplines.find((item) => item.id === next);
                  if (selected) {
                    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.DisciplineSelected, {
                      source: "publish_service",
                      discipline_id: selected.id,
                      stage_id: selected.stageId,
                      discipline_slug: selected.slug,
                    });
                  }
                  trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
                    source: "publish_service",
                    filter_name: "disciplina",
                    has_value: Boolean(next),
                    discipline_id: selected?.id,
                    stage_id: selected?.stageId,
                  });
                }}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Sin especificar</option>
                {filteredDisciplines.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Servicio especifico (opcional)
              </label>
              <select
                value={requestedServiceId ? String(requestedServiceId) : ""}
                onChange={(event) => {
                  const next = event.target.value ? Number(event.target.value) : undefined;
                  setRequestedServiceId(next);
                  const selected = filteredServices.find((item) => item.id === next);
                  if (selected) {
                    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ServiceSelected, {
                      source: "publish_service",
                      service_id: selected.id,
                      discipline_id: selected.disciplineId,
                      stage_id: selected.stageId,
                      service_slug: selected.slug,
                    });
                  }
                  trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
                    source: "publish_service",
                    filter_name: "servicio",
                    has_value: Boolean(next),
                    service_id: selected?.id,
                    discipline_id: selected?.disciplineId,
                    stage_id: selected?.stageId,
                  });
                }}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Sin especificar</option>
                {filteredServices.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Tipo de trabajo (opcional)
              </label>
              <select
                value={requestedWorkTypeId ? String(requestedWorkTypeId) : ""}
                onChange={(event) => {
                  const next = event.target.value ? Number(event.target.value) : undefined;
                  setRequestedWorkTypeId(next);
                  trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
                    source: "publish_service",
                    filter_name: "tipo_obra",
                    has_value: Boolean(next),
                    work_type_id: next,
                  });
                }}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Sin especificar</option>
                {(taxonomyCatalog?.workTypes ?? []).map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Presupuesto estimado (RD$)
              </label>
              <input
                type="text"
                placeholder="Ej: 50,000 - 100,000"
                value={estimatedBudget}
                onChange={(event) => setEstimatedBudget(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent font-tabular"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej: 809-123-4567"
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-card obra-shadow text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent font-tabular"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recomendado: numero activo en horario laboral para convertir leads en visitas y cotizaciones.
              </p>
            </div>

            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishService;
