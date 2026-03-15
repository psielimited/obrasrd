import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useMyProfile, useMyProviderProfile } from "@/hooks/use-profile-data";
import { useProviderLeads, leadQueryKeys } from "@/hooks/use-leads-data";
import { LeadStatus, updateLead } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed_won: "Cerrado - Ganado",
  closed_lost: "Cerrado - Perdido",
};

const ProviderLeadsPage = () => {
  const { data: profile } = useMyProfile();
  const { data: providerProfile } = useMyProviderProfile();
  const { data: leads = [], isLoading } = useProviderLeads(providerProfile?.id);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [draftStatuses, setDraftStatuses] = useState<Record<string, LeadStatus>>({});
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const summary = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        acc[lead.status] += 1;
        return acc;
      },
      {
        total: 0,
        new: 0,
        contacted: 0,
        qualified: 0,
        closed_won: 0,
        closed_lost: 0,
      } as Record<"total" | LeadStatus, number>,
    );
  }, [leads]);

  if (profile?.role !== "provider") {
    return (
      <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
        <div className="container max-w-2xl mx-auto bg-card p-6 rounded-xl obra-shadow space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads de proveedor</h1>
          <p className="text-sm text-muted-foreground">Debes tener rol Proveedor para ver esta bandeja.</p>
          <Link to="/perfil" className="text-sm font-semibold text-accent hover:underline">
            Ir a mi perfil
          </Link>
        </div>
      </div>
    );
  }

  if (!providerProfile) {
    return (
      <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
        <div className="container max-w-2xl mx-auto bg-card p-6 rounded-xl obra-shadow space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Leads de proveedor</h1>
          <p className="text-sm text-muted-foreground">Completa primero tu perfil de proveedor para recibir leads.</p>
          <Link to="/dashboard/proveedor" className="text-sm font-semibold text-accent hover:underline">
            Completar perfil
          </Link>
        </div>
      </div>
    );
  }

  const onSaveLead = async (leadId: string) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) return;

    setIsSaving(leadId);
    try {
      await updateLead(leadId, {
        status: draftStatuses[leadId] ?? lead.status,
        providerReply: draftReplies[leadId] ?? lead.providerReply,
      });

      await queryClient.invalidateQueries({ queryKey: leadQueryKeys.providerLeads(providerProfile.id) });

      toast({
        title: "Lead actualizado",
        description: "El estado del lead se guardo correctamente.",
      });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto space-y-5">
        <div className="bg-card p-6 rounded-xl obra-shadow">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Bandeja de leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona solicitudes de cotizacion recibidas en tu perfil.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 mt-4">
            <div className="bg-muted rounded-lg p-2 text-center">
              <p className="text-[10px] uppercase text-muted-foreground">Total</p>
              <p className="text-sm font-bold">{summary.total}</p>
            </div>
            {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((status) => (
              <div key={status} className="bg-muted rounded-lg p-2 text-center">
                <p className="text-[10px] uppercase text-muted-foreground">{STATUS_LABELS[status]}</p>
                <p className="text-sm font-bold">{summary[status]}</p>
              </div>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card p-6 rounded-xl obra-shadow">
            <p className="text-sm text-muted-foreground">Cargando leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="bg-card p-6 rounded-xl obra-shadow">
            <p className="text-sm text-muted-foreground">Aun no tienes leads. Comparte tu perfil para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => {
              const status = draftStatuses[lead.id] ?? lead.status;
              const reply = draftReplies[lead.id] ?? lead.providerReply ?? "";
              const whatsappUrl = lead.requesterContact
                ? `https://wa.me/${lead.requesterContact.replace(/[^\d]/g, "")}`
                : null;

              return (
                <div key={lead.id} className="bg-card p-4 rounded-xl obra-shadow space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{lead.requesterName || "Solicitante"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground">
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </div>

                  {lead.requesterContact && (
                    <p className="text-xs text-muted-foreground">Contacto: {lead.requesterContact}</p>
                  )}

                  {lead.estimatedBudget && (
                    <p className="text-xs text-muted-foreground">Presupuesto: {lead.estimatedBudget}</p>
                  )}

                  <p className="text-sm text-foreground">{lead.message}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Estado</label>
                      <select
                        value={status}
                        onChange={(event) =>
                          setDraftStatuses((prev) => ({ ...prev, [lead.id]: event.target.value as LeadStatus }))
                        }
                        className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent text-sm"
                      >
                        {(Object.keys(STATUS_LABELS) as LeadStatus[]).map((option) => (
                          <option key={option} value={option}>
                            {STATUS_LABELS[option]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Nota interna</label>
                      <input
                        value={reply}
                        onChange={(event) =>
                          setDraftReplies((prev) => ({ ...prev, [lead.id]: event.target.value }))
                        }
                        placeholder="Ej: Contactado por WhatsApp"
                        className="w-full px-3 py-2 rounded-lg bg-card obra-shadow outline-none focus:ring-2 focus:ring-accent text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => onSaveLead(lead.id)}
                      disabled={isSaving === lead.id}
                    >
                      {isSaving === lead.id ? "Guardando..." : "Guardar"}
                    </Button>
                    {whatsappUrl && (
                      <Button variant="whatsapp" size="sm" onClick={() => window.open(whatsappUrl, "_blank")}>
                        WhatsApp
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderLeadsPage;
