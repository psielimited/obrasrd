import type { LeadStatus } from "@/lib/leads-api";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed_won: "Cerrado - Ganado",
  closed_lost: "Cerrado - Perdido",
};
