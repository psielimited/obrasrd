import type { Phase } from "@/data/marketplace";
import type { TaxonomyCatalog } from "@/lib/taxonomy-api";
import type { IntakeUrgency, ProjectIntakeDraft } from "@/lib/project-intake";
import { INTAKE_URGENCY_OPTIONS } from "@/lib/project-intake";
import { OBRASRD_ANALYTICS_EVENTS } from "@/lib/analytics/events";
import { trackObrasRdEvent } from "@/lib/analytics/track";
import { Button } from "@/components/ui/button";

interface ProjectIntakeFormProps {
  draft: ProjectIntakeDraft;
  phases: Phase[];
  taxonomy?: TaxonomyCatalog;
  isAuthenticated: boolean;
  isUploadingImage: boolean;
  attachmentNames: string[];
  onChange: (patch: Partial<ProjectIntakeDraft>) => void;
  onUploadImage: (file: File) => Promise<void>;
  onRemoveAttachment: (index: number) => void;
  onContinue: () => void;
  continueDisabled: boolean;
}

const ProjectIntakeForm = ({
  draft,
  phases,
  taxonomy,
  isAuthenticated,
  isUploadingImage,
  attachmentNames,
  onChange,
  onUploadImage,
  onRemoveAttachment,
  onContinue,
  continueDisabled,
}: ProjectIntakeFormProps) => {
  const filteredDisciplines = (taxonomy?.disciplines ?? []).filter((item) =>
    draft.stageId ? item.stageId === draft.stageId : true,
  );

  const filteredServices = (taxonomy?.services ?? []).filter((item) => {
    if (draft.stageId && item.stageId !== draft.stageId) return false;
    if (draft.disciplineId && item.disciplineId !== draft.disciplineId) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Tipo de obra</label>
        <select
          value={draft.projectTypeId ? String(draft.projectTypeId) : ""}
          onChange={(event) => {
            const value = event.target.value ? Number(event.target.value) : undefined;
            const selected = (taxonomy?.workTypes ?? []).find((item) => item.id === value);
            onChange({ projectTypeId: value, projectTypeLabel: selected?.name });
            trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.FilterApplied, {
              source: "project_intake",
              filter_name: "tipo_obra",
              has_value: Boolean(selected),
              work_type_id: selected?.id,
            });
          }}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Seleccionar</option>
          {(taxonomy?.workTypes ?? []).map((item) => (
            <option key={item.id} value={String(item.id)}>{item.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Etapa actual</label>
        <select
          value={draft.stageId ? String(draft.stageId) : ""}
          onChange={(event) => {
            const nextStage = event.target.value ? Number(event.target.value) : undefined;
            onChange({ stageId: nextStage, disciplineId: undefined, serviceId: undefined });
            if (nextStage) {
              trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.StageSelected, {
                source: "project_intake",
                stage_id: nextStage,
              });
            }
          }}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Seleccionar</option>
          {phases.map((phase) => (
            <option key={phase.id} value={String(phase.id)}>{phase.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Disciplina requerida</label>
        <select
          value={draft.disciplineId ? String(draft.disciplineId) : ""}
          onChange={(event) => {
            const nextDisciplineId = event.target.value ? Number(event.target.value) : undefined;
            const selected = filteredDisciplines.find((item) => item.id === nextDisciplineId);
            onChange({ disciplineId: nextDisciplineId, serviceId: undefined });
            if (selected) {
              trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.DisciplineSelected, {
                source: "project_intake",
                discipline_id: selected.id,
                stage_id: selected.stageId,
                discipline_slug: selected.slug,
              });
            }
          }}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Seleccionar</option>
          {filteredDisciplines.map((item) => (
            <option key={item.id} value={String(item.id)}>{item.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Servicio especifico</label>
        <select
          value={draft.serviceId ? String(draft.serviceId) : ""}
          onChange={(event) => {
            const nextServiceId = event.target.value ? Number(event.target.value) : undefined;
            const selected = filteredServices.find((item) => item.id === nextServiceId);
            onChange({ serviceId: nextServiceId });
            if (selected) {
              trackObrasRdEvent(OBRASRD_ANALYTICS_EVENTS.ServiceSelected, {
                source: "project_intake",
                service_id: selected.id,
                discipline_id: selected.disciplineId,
                stage_id: selected.stageId,
                service_slug: selected.slug,
              });
            }
          }}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">Seleccionar</option>
          {filteredServices.map((item) => (
            <option key={item.id} value={String(item.id)}>{item.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Ubicacion</label>
        <input
          type="text"
          placeholder="Ej: Santo Domingo Este"
          value={draft.location}
          onChange={(event) => onChange({ location: event.target.value })}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Presupuesto aproximado o rango</label>
        <input
          type="text"
          placeholder="Ej: RD$ 150,000 - RD$ 250,000"
          value={draft.budget}
          onChange={(event) => onChange({ budget: event.target.value })}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Fecha estimada</label>
        <input
          type="date"
          value={draft.estimatedDate}
          onChange={(event) => onChange({ estimatedDate: event.target.value })}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Urgencia</label>
        <div className="grid grid-cols-3 gap-2">
          {INTAKE_URGENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ urgency: option.value as IntakeUrgency })}
              className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wide ${
                draft.urgency === option.value
                  ? "border-accent bg-accent/15 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Descripcion</label>
        <textarea
          rows={4}
          placeholder="Describe alcance, metraje, condiciones del sitio, y lo que esperas del proveedor."
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
          className="w-full resize-none rounded-lg bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Nombre de contacto</label>
        <input
          type="text"
          placeholder="Tu nombre"
          value={draft.requesterName}
          onChange={(event) => onChange({ requesterName: event.target.value })}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Telefono / WhatsApp</label>
        <input
          type="tel"
          placeholder="809-123-4567"
          value={draft.requesterContact}
          onChange={(event) => onChange({ requesterContact: event.target.value })}
          className="w-full rounded-lg bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fotos / adjuntos</p>
        {!isAuthenticated ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Disponible para usuarios autenticados.
          </p>
        ) : (
          <div className="mt-2 space-y-2">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void onUploadImage(file);
                event.currentTarget.value = "";
              }}
              disabled={isUploadingImage}
              className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground hover:file:bg-muted/80"
            />
            {attachmentNames.length > 0 && (
              <div className="space-y-1">
                {attachmentNames.map((name, index) => (
                  <div key={`${name}-${index}`} className="flex items-center justify-between text-xs text-foreground">
                    <span className="truncate">{name}</span>
                    <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => onRemoveAttachment(index)}>
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <Button size="lg" className="w-full" onClick={onContinue} disabled={continueDisabled}>
        Ver proveedores recomendados
      </Button>
    </div>
  );
};

export default ProjectIntakeForm;
