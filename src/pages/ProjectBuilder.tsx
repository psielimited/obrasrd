import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectIntakeForm from "@/components/project-intake/ProjectIntakeForm";
import ProviderMatchSelector from "@/components/project-intake/ProviderMatchSelector";
import { usePhases, useProviders } from "@/hooks/use-marketplace-data";
import { useTaxonomyCatalog } from "@/hooks/use-taxonomy-data";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { createLead } from "@/lib/leads-api";
import {
  buildProjectIntakeLeadMessage,
  type ProjectIntakeDraft,
  validateTaxonomyDependency,
} from "@/lib/project-intake";
import { matchProvidersDeterministic } from "@/lib/provider-matching";
import { createRequestMediaSignedUrl, uploadImageAsset } from "@/lib/media-api";
import { useToast } from "@/hooks/use-toast";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { deriveProvinceFromText } from "@/lib/analytics/province";
import { trackObrasRdEvent } from "@/lib/analytics/track";

type IntakeStep = "intake" | "matching" | "confirmation";

interface RequestAttachment {
  name: string;
  objectPath: string;
  signedUrl: string;
}

const ProjectBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthSession();
  const { data: profile } = useMyProfile();
  const { data: phases = [] } = usePhases();
  const { data: providers = [] } = useProviders();
  const { data: taxonomyCatalog } = useTaxonomyCatalog();

  const [step, setStep] = useState<IntakeStep>("intake");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>([]);
  const [createdLeadsCount, setCreatedLeadsCount] = useState(0);
  const [failedLeadsCount, setFailedLeadsCount] = useState(0);
  const [attachments, setAttachments] = useState<RequestAttachment[]>([]);
  const [draft, setDraft] = useState<ProjectIntakeDraft>({
    projectTypeId: undefined,
    projectTypeLabel: undefined,
    stageId: undefined,
    disciplineId: undefined,
    serviceId: undefined,
    location: "",
    budget: "",
    estimatedDate: "",
    description: "",
    urgency: "media",
    requesterName: "",
    requesterContact: "",
    attachmentUrls: [],
  });

  useEffect(() => {
    if (!user) return;
    if (!draft.requesterName.trim() && profile?.displayName) {
      setDraft((prev) => ({ ...prev, requesterName: profile.displayName ?? prev.requesterName }));
    }
    if (!draft.requesterContact.trim() && profile?.phone) {
      setDraft((prev) => ({ ...prev, requesterContact: profile.phone ?? prev.requesterContact }));
    }
  }, [draft.requesterContact, draft.requesterName, profile?.displayName, profile?.phone, user]);

  const providerMatches = useMemo(() => {
    const selectedWorkTypeCode = taxonomyCatalog?.workTypes.find((item) => item.id === draft.projectTypeId)?.code;
    const matches = matchProvidersDeterministic(providers, {
      stageId: draft.stageId,
      disciplineId: draft.disciplineId,
      serviceId: draft.serviceId,
      workTypeId: draft.projectTypeId,
      workTypeCode: selectedWorkTypeCode,
      location: draft.location,
    });
    return matches.filter((item) => item.score > 0);
  }, [draft.disciplineId, draft.location, draft.projectTypeId, draft.serviceId, draft.stageId, providers, taxonomyCatalog?.workTypes]);

  const intakeProgress = step === "intake" ? 1 : step === "matching" ? 2 : 3;
  const intakeReady =
    Boolean(draft.stageId) &&
    Boolean(draft.location.trim()) &&
    Boolean(draft.description.trim()) &&
    Boolean(draft.requesterContact.trim());

  const onPatchDraft = (patch: Partial<ProjectIntakeDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  };

  const onUploadImage = async (file: File) => {
    if (!user) {
      toast({
        title: "Inicia sesion para adjuntar",
        description: "Los adjuntos de solicitud requieren autenticacion.",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const uploaded = await uploadImageAsset({
        file,
        entityType: "lead_request",
      });
      const signedUrl = await createRequestMediaSignedUrl(uploaded.objectPath);

      setAttachments((prev) => [...prev, { name: file.name, objectPath: uploaded.objectPath, signedUrl }]);
      setDraft((prev) => ({ ...prev, attachmentUrls: [...prev.attachmentUrls, signedUrl] }));
    } catch (error) {
      toast({
        title: "No se pudo subir el adjunto",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const onRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setDraft((prev) => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter((_, i) => i !== index),
    }));
  };

  const onContinueToMatching = () => {
    const taxonomyError = validateTaxonomyDependency(draft, taxonomyCatalog);
    if (taxonomyError) {
      toast({
        title: "Revisa la taxonomia seleccionada",
        description: taxonomyError,
        variant: "destructive",
      });
      return;
    }

    if (!intakeReady) {
      toast({
        title: "Completa los campos clave",
        description: "Etapa, ubicacion, descripcion y contacto son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const initialSelection = providerMatches.slice(0, 5).map((item) => item.provider.id);
    setSelectedProviderIds(initialSelection);
    setStep("matching");
  };

  const onToggleProvider = (providerId: string) => {
    setSelectedProviderIds((prev) =>
      prev.includes(providerId) ? prev.filter((id) => id !== providerId) : [...prev, providerId],
    );
  };

  const onSubmitLeads = async () => {
    if (selectedProviderIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    let created = 0;
    let failed = 0;

    for (const providerId of selectedProviderIds) {
      try {
        await createLead({
          providerId,
          requesterName: draft.requesterName.trim() || undefined,
          requesterContact: draft.requesterContact.trim(),
          estimatedBudget: draft.budget.trim() || undefined,
          message: buildProjectIntakeLeadMessage(draft),
          requestedStageId: draft.stageId,
          requestedDisciplineId: draft.disciplineId,
          requestedServiceId: draft.serviceId,
          requestedWorkTypeId: draft.projectTypeId,
        });
        created += 1;
      } catch {
        failed += 1;
      }
    }

    setCreatedLeadsCount(created);
    setFailedLeadsCount(failed);
    setIsSubmitting(false);
    setStep("confirmation");
    trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ProjectRequestCreated, {
      source: "project_builder",
      provider_count: selectedProviderIds.length,
      success_count: created,
      failed_count: failed,
      stage_id: draft.stageId,
      discipline_id: draft.disciplineId,
      service_id: draft.serviceId,
      work_type_id: draft.projectTypeId,
      province: deriveProvinceFromText(draft.location),
    });

    if (created > 0) {
      toast({
        title: "Solicitud enviada",
        description: `Enviamos tu solicitud a ${created} proveedor(es).`,
      });
    } else {
      toast({
        title: "No se pudo enviar",
        description: "No fue posible crear leads. Revisa los datos e intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <div className="px-4 py-5 md:py-6">
        <div className="container mx-auto max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => (step === "intake" ? navigate(-1) : setStep("intake"))} className="mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {step === "intake" ? "Volver" : "Regresar al formulario"}
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-foreground">Intake de proyecto</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crea una solicitud estructurada y conectala directamente al flujo actual de leads.
          </p>

          <div className="my-5 flex gap-1">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${index <= intakeProgress ? "bg-accent" : "bg-muted"}`}
              />
            ))}
          </div>

          {step === "intake" && (
            <ProjectIntakeForm
              draft={draft}
              phases={phases}
              taxonomy={taxonomyCatalog}
              isAuthenticated={Boolean(user)}
              isUploadingImage={isUploadingImage}
              attachmentNames={attachments.map((item) => item.name)}
              onChange={onPatchDraft}
              onUploadImage={onUploadImage}
              onRemoveAttachment={onRemoveAttachment}
              onContinue={onContinueToMatching}
              continueDisabled={!intakeReady || isUploadingImage}
            />
          )}

          {step === "matching" && (
            <ProviderMatchSelector
              matches={providerMatches}
              selectedProviderIds={selectedProviderIds}
              onToggleProvider={onToggleProvider}
              onBack={() => setStep("intake")}
              onSubmit={onSubmitLeads}
              isSubmitting={isSubmitting}
            />
          )}

          {step === "confirmation" && (
            <div className="space-y-4 rounded-xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                <div>
                  <p className="text-base font-semibold text-foreground">Solicitud procesada</p>
                  <p className="text-sm text-muted-foreground">
                    Leads creados: {createdLeadsCount}
                    {failedLeadsCount > 0 ? ` • Fallidos: ${failedLeadsCount}` : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Tu solicitud ya entro al flujo de contacto existente. Los proveedores recibiran las notificaciones y podras continuar por chat donde aplique.
                </p>
                {failedLeadsCount > 0 && (
                  <p>
                    Algunas entregas fallaron (por ejemplo, disponibilidad/cuota del proveedor). Puedes ajustar y reenviar a otros perfiles.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {user ? (
                  <Button className="flex-1" onClick={() => navigate("/dashboard/cliente/solicitudes")}>
                    Ir a mis solicitudes
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={() => navigate("/auth", { state: { from: "/proyectos" } })}>
                    Crear cuenta para seguimiento
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const params = new URLSearchParams();
                    const stageSlug = phases.find((phase) => phase.id === draft.stageId)?.slug;
                    if (stageSlug) params.set("etapa", stageSlug);
                    const workTypeCode = taxonomyCatalog?.workTypes.find((item) => item.id === draft.projectTypeId)?.code;
                    if (workTypeCode) params.set("tipo_obra", workTypeCode);
                    if (draft.location.trim()) params.set("q", draft.location.trim());
                    navigate(`/buscar?${params.toString()}`);
                  }}
                >
                  Ver proveedores
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilder;
