export type ProviderSignupType =
  | "empresa"
  | "profesional_independiente"
  | "suplidor"
  | "servicio_tecnico";

export interface ProviderSignupTypeOption {
  id: ProviderSignupType;
  label: string;
  subtitle: string;
  helper: string;
  businessNameLabel: string;
  businessNamePlaceholder: string;
  tradeLabel: string;
  tradePlaceholder: string;
}

export const PROVIDER_SIGNUP_TYPE_OPTIONS: ProviderSignupTypeOption[] = [
  {
    id: "empresa",
    label: "Empresa",
    subtitle: "Constructora o firma",
    helper: "Ideal para equipos con marca comercial y varios servicios.",
    businessNameLabel: "Nombre de la empresa",
    businessNamePlaceholder: "Ej: Constructora Hermanos Perez",
    tradeLabel: "Linea principal de servicios",
    tradePlaceholder: "Ej: Diseno, construccion y supervision de obras",
  },
  {
    id: "profesional_independiente",
    label: "Profesional independiente",
    subtitle: "Persona fisica",
    helper: "Para especialistas que trabajan por cuenta propia.",
    businessNameLabel: "Nombre profesional",
    businessNamePlaceholder: "Ej: Arq. Ana Martinez",
    tradeLabel: "Especialidad principal",
    tradePlaceholder: "Ej: Diseno arquitectonico residencial",
  },
  {
    id: "suplidor",
    label: "Suplidor",
    subtitle: "Materiales y equipos",
    helper: "Enfocado en venta y despacho de materiales o insumos.",
    businessNameLabel: "Nombre comercial del suplidor",
    businessNamePlaceholder: "Ej: Materiales del Cibao",
    tradeLabel: "Que suples principalmente",
    tradePlaceholder: "Ej: Cemento, blocks y agregados",
  },
  {
    id: "servicio_tecnico",
    label: "Servicio tecnico",
    subtitle: "Instalacion y mantenimiento",
    helper: "Para cuadrillas o tecnicos especializados en sistemas.",
    businessNameLabel: "Nombre del servicio tecnico",
    businessNamePlaceholder: "Ej: Tecnofrio RD",
    tradeLabel: "Especialidad tecnica principal",
    tradePlaceholder: "Ej: Instalacion y mantenimiento de HVAC",
  },
];

export interface ProviderOnboardingDraft {
  providerType: ProviderSignupType;
  displayName: string;
  trade: string;
  city: string;
  whatsapp?: string;
}

export const PROVIDER_ONBOARDING_DRAFT_KEY = "obrasrd.provider_onboarding_draft.v1";

export const getProviderSignupTypeOption = (
  providerType: ProviderSignupType,
): ProviderSignupTypeOption =>
  PROVIDER_SIGNUP_TYPE_OPTIONS.find((item) => item.id === providerType) ??
  PROVIDER_SIGNUP_TYPE_OPTIONS[0];

export const readStoredProviderOnboardingDraft = (): ProviderOnboardingDraft | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROVIDER_ONBOARDING_DRAFT_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ProviderOnboardingDraft>;
    if (!parsed.providerType || !parsed.displayName || !parsed.trade || !parsed.city) return null;
    return {
      providerType: parsed.providerType,
      displayName: parsed.displayName,
      trade: parsed.trade,
      city: parsed.city,
      whatsapp: parsed.whatsapp?.trim() || undefined,
    };
  } catch {
    return null;
  }
};

export const storeProviderOnboardingDraft = (draft: ProviderOnboardingDraft): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROVIDER_ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
};

export const clearStoredProviderOnboardingDraft = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROVIDER_ONBOARDING_DRAFT_KEY);
};
