import type { TaxonomyCatalog } from "@/lib/taxonomy-api";

export type IntakeUrgency = "baja" | "media" | "alta";

export interface ProjectIntakeDraft {
  projectTypeId?: number;
  projectTypeLabel?: string;
  stageId?: number;
  disciplineId?: number;
  serviceId?: number;
  location: string;
  budget: string;
  estimatedDate: string;
  description: string;
  urgency: IntakeUrgency;
  requesterName: string;
  requesterContact: string;
  attachmentUrls: string[];
}

export const INTAKE_URGENCY_OPTIONS: { value: IntakeUrgency; label: string }[] = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
];

export const validateTaxonomyDependency = (
  draft: ProjectIntakeDraft,
  taxonomy: TaxonomyCatalog | undefined,
): string | null => {
  if (!taxonomy) return null;
  const taxonomyStageIds = new Set([
    ...taxonomy.disciplines.map((item) => item.stageId),
    ...taxonomy.services.map((item) => item.stageId),
  ]);
  const canValidateStageStrictly = Boolean(draft.stageId && taxonomyStageIds.has(draft.stageId));

  if (draft.disciplineId && draft.stageId) {
    const discipline = taxonomy.disciplines.find((item) => item.id === draft.disciplineId);
    if (!discipline) {
      return "La disciplina seleccionada no existe en el catalogo.";
    }

    if (canValidateStageStrictly && discipline.stageId !== draft.stageId) {
      return "La disciplina seleccionada no pertenece a la etapa elegida.";
    }
  }

  if (draft.serviceId) {
    const service = taxonomy.services.find((item) => item.id === draft.serviceId);
    if (!service) {
      return "El servicio seleccionado no existe en el catalogo.";
    }

    if (draft.disciplineId && service.disciplineId !== draft.disciplineId) {
      return "El servicio seleccionado no pertenece a la disciplina elegida.";
    }

    if (canValidateStageStrictly && draft.stageId && service.stageId !== draft.stageId) {
      return "El servicio seleccionado no pertenece a la etapa elegida.";
    }
  }

  return null;
};

export const buildProjectIntakeLeadMessage = (draft: ProjectIntakeDraft): string => {
  const lines = [
    "Solicitud de proyecto desde flujo de intake",
    `Urgencia: ${draft.urgency}`,
    `Ubicacion: ${draft.location.trim()}`,
    `Tipo de obra: ${draft.projectTypeLabel || "No especificado"}`,
    `Fecha estimada: ${draft.estimatedDate || "No especificada"}`,
    `Presupuesto: ${draft.budget.trim() || "No especificado"}`,
    "",
    "Descripcion:",
    draft.description.trim(),
  ];

  if (draft.attachmentUrls.length > 0) {
    lines.push("", "Adjuntos:");
    for (const url of draft.attachmentUrls) {
      lines.push(`- ${url}`);
    }
  }

  return lines.join("\n");
};
