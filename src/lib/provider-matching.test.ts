import { describe, expect, it } from "vitest";
import { matchProvidersDeterministic } from "@/lib/provider-matching";
import type { Provider } from "@/data/marketplace";

const baseProvider = (overrides: Partial<Provider>): Provider => ({
  id: "p",
  name: "Proveedor",
  trade: "Trade",
  categorySlug: "categoria",
  phaseId: 1,
  location: "Santo Domingo",
  city: "Santo Domingo",
  yearsExperience: 5,
  description: "Desc",
  rating: 4.5,
  reviewCount: 10,
  completedProjects: 20,
  verified: false,
  isFeatured: false,
  whatsapp: "8090000000",
  startingPrice: undefined,
  portfolioImages: [],
  serviceAreas: [],
  serviceIds: [],
  workTypeIds: [],
  ...overrides,
});

describe("provider deterministic matching", () => {
  it("ranks higher by relevance score", () => {
    const providers: Provider[] = [
      baseProvider({
        id: "high",
        name: "High",
        primaryServiceId: 100,
        primaryDisciplineId: 10,
        phaseId: 2,
        workTypeIds: [5],
        serviceAreas: ["Santiago"],
        trustSnapshot: { providerVerified: true, identityConfirmed: false, portfolioValidated: false, projectRegistered: false, rapidResponse: false, activeThisMonth: true },
        portfolioImages: ["https://img"],
      }),
      baseProvider({
        id: "low",
        name: "Low",
        phaseId: 2,
      }),
    ];

    const ranked = matchProvidersDeterministic(providers, {
      stageId: 2,
      disciplineId: 10,
      serviceId: 100,
      workTypeId: 5,
      location: "Santiago",
    });

    expect(ranked[0].provider.id).toBe("high");
    expect(ranked[0].reasons).toContain("ofrece este servicio");
    expect(ranked[0].reasons).toContain("trabaja en tu zona");
    expect(ranked[0].reasons).toContain("tiene portafolio");
    expect(ranked[0].reasons).toContain("esta verificado");
  });

  it("uses featured as tie-breaker only", () => {
    const providers: Provider[] = [
      baseProvider({ id: "featured", name: "Featured", isFeatured: true, phaseId: 1 }),
      baseProvider({ id: "non", name: "Non", isFeatured: false, phaseId: 1 }),
    ];

    const ranked = matchProvidersDeterministic(providers, { stageId: 1 });
    expect(ranked[0].provider.id).toBe("featured");
    expect(ranked[0].score).toBe(ranked[1].score);
  });

  it("falls back to legacy mapped work type when provider has no explicit workTypeIds", () => {
    const providers: Provider[] = [
      baseProvider({
        id: "legacy",
        name: "Legacy",
        categorySlug: "excavacion",
        workTypeIds: [],
      }),
    ];

    const ranked = matchProvidersDeterministic(providers, { workTypeCode: "obra_exterior" });
    expect(ranked[0].signals.workTypeMatch).toBe(true);
    expect(ranked[0].reasons).toContain("maneja este tipo de obra");
  });
});
