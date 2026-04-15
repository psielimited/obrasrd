import { describe, expect, it } from "vitest";
import { buildSearchNormalization, normalizeSearchText } from "@/lib/search/search-normalization";

const phraseCoverage = [
  { query: "poner piso", synonymId: "poner_piso" },
  { query: "tirar una loza", synonymId: "tirar_loza" },
  { query: "hacer planos", synonymId: "hacer_planos" },
  { query: "arreglar filtracion", synonymId: "arreglar_filtracion" },
  { query: "levantar una pared", synonymId: "levantar_pared" },
  { query: "hacer una marquesina", synonymId: "hacer_marquesina" },
  { query: "tirar corriente", synonymId: "tirar_corriente" },
  { query: "reparar techo", synonymId: "reparar_techo" },
  { query: "remodelar baño", synonymId: "remodelar_bano" },
] as const;

describe("search normalization", () => {
  it("normalizes accents and casing", () => {
    expect(normalizeSearchText("  Filtracion EN Techo ")).toBe("filtracion en techo");
  });

  it("expands dominican colloquial query to canonical taxonomy terms", () => {
    const result = buildSearchNormalization("tirar corriente");

    expect(result.matchedSynonymIds).toContain("tirar_corriente");
    expect(result.searchTerms).toContain("instalacion electrica");
    expect(result.canonicalHints.disciplineSlugs).toContain("ingenieria_electrica");
    expect(result.canonicalHints.serviceSlugs).toContain("instalacion_electrica");
  });

  for (const scenario of phraseCoverage) {
    it(`covers common phrase: ${scenario.query}`, () => {
      const result = buildSearchNormalization(scenario.query);
      expect(result.matchedSynonymIds).toContain(scenario.synonymId);
      expect(result.searchTerms.length).toBeGreaterThan(1);
      expect(result.unmatchedNormalizedQuery).toBe(false);
    });
  }

  it("supports additional dominican construction phrases", () => {
    const result = buildSearchNormalization("hacer verja");
    expect(result.matchedSynonymIds).toContain("cerramiento_perimetral");
    expect(result.canonicalHints.workTypeSlugs).toContain("obra_exterior");
  });

  it("handles singular/plural tolerance", () => {
    const result = buildSearchNormalization("planos");
    expect(result.normalizedTokens).toContain("planos");
    expect(result.normalizedTokens).toContain("plano");
  });

  it("marks unmatched normalized queries safely", () => {
    const result = buildSearchNormalization("xyzqzz plim rara");
    expect(result.unmatchedNormalizedQuery).toBe(true);
    expect(result.searchTerms).toContain("xyzqzz plim rara");
  });
});
