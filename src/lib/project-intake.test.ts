import { describe, expect, it } from "vitest";
import { validateTaxonomyDependency, type ProjectIntakeDraft } from "@/lib/project-intake";
import type { TaxonomyCatalog } from "@/lib/taxonomy-api";

const taxonomy: TaxonomyCatalog = {
  disciplines: [
    { id: 10, slug: "d1", name: "Disciplina A", stageId: 1 },
    { id: 11, slug: "d2", name: "Disciplina B", stageId: 2 },
  ],
  services: [
    { id: 20, slug: "s1", name: "Servicio A", stageId: 1, disciplineId: 10 },
    { id: 21, slug: "s2", name: "Servicio B", stageId: 2, disciplineId: 11 },
  ],
  workTypes: [],
};

const baseDraft: ProjectIntakeDraft = {
  projectTypeId: undefined,
  projectTypeLabel: undefined,
  stageId: undefined,
  disciplineId: undefined,
  serviceId: undefined,
  location: "Santo Domingo",
  budget: "",
  estimatedDate: "",
  description: "Necesito cotizar",
  urgency: "media",
  requesterName: "Ana",
  requesterContact: "8090000000",
  attachmentUrls: [],
};

describe("project intake taxonomy validation", () => {
  it("accepts coherent stage -> discipline -> service", () => {
    const result = validateTaxonomyDependency(
      { ...baseDraft, stageId: 1, disciplineId: 10, serviceId: 20 },
      taxonomy,
    );
    expect(result).toBeNull();
  });

  it("rejects discipline outside selected stage", () => {
    const result = validateTaxonomyDependency(
      { ...baseDraft, stageId: 1, disciplineId: 11 },
      taxonomy,
    );
    expect(result).toContain("disciplina");
  });

  it("rejects service outside selected discipline", () => {
    const result = validateTaxonomyDependency(
      { ...baseDraft, stageId: 2, disciplineId: 11, serviceId: 20 },
      taxonomy,
    );
    expect(result).toContain("servicio");
  });
});
