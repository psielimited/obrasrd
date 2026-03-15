import { useMemo } from "react";
import { MessageSquareWarning, RotateCcw, XCircle, Archive } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyRequestedLeads, leadQueryKeys } from "@/hooks/use-leads-data";
import { RequesterState, type LeadStatus, updateMyLeadState } from "@/lib/leads-api";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const REQUESTER_STATE_LABELS: Record<RequesterState, string> = {
  active: "Activa",
  cancelled: "Cancelada",
  archived: "Archivada",
};

const REQUESTER_STATE_CLASSES: Record<RequesterState, string> = {
  active: "border-emerald-500/40 text-emerald-300",
  cancelled: "border-rose-500/40 text-rose-300",
  archived: "border-slate-500/40 text-slate-300",
};

const ConsumerRequestsPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: requests = [], isLoading } = useMyRequestedLeads();

  const sorted = useMemo(() => [...requests].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [requests]);

  const updateState = async (leadId: string, state: RequesterState) => {
    try {
      await updateMyLeadState(leadId, state);
      await queryClient.invalidateQueries({ queryKey: leadQueryKeys.myRequests });
      toast({ title: "Solicitud actualizada", description: `Estado cambiado a ${REQUESTER_STATE_LABELS[state]}.` });
    } catch (error) {
      toast({
        title: "No se pudo actualizar",
        description: error instanceof Error ? error.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <ConsumerDashboardLayout
      title="Mis solicitudes"
      subtitle="Monitorea estado y seguimiento de tus cotizaciones"
      actionLabel="Acciones"
    >
      <div className="space-y-6">
        <SectionCard title="Resumen" description="Flujo actual de tus solicitudes">
          <div className="grid gap-3 md:grid-cols-5">
            {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((status) => (
              <div key={status} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{LEAD_STATUS_LABELS[status]}</p>
                <p className="text-xl font-bold text-slate-100 mt-1">{requests.filter((item) => item.status === status).length}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Listado" description="Solicitudes enviadas recientemente">
          {isLoading ? (
            <p className="text-sm text-slate-400">Cargando solicitudes...</p>
          ) : sorted.length === 0 ? (
            <EmptyState
              title="No tienes solicitudes"
              description="Desde un perfil de proveedor puedes enviar una solicitud de cotizacion."
              icon={MessageSquareWarning}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead>Solicitud</TableHead>
                  <TableHead>Estado proveedor</TableHead>
                  <TableHead>Estado cliente</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((lead) => (
                  <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-900/40">
                    <TableCell>
                      <p className="text-sm font-semibold text-slate-100">{lead.requesterName || "Solicitud"}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{lead.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{lead.estimatedBudget || "Sin presupuesto"}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={REQUESTER_STATE_CLASSES[lead.requesterState]}>
                        {REQUESTER_STATE_LABELS[lead.requesterState]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="outline" className="border-slate-700 text-slate-300">Creada</Badge>
                        {lead.contactedAt && <Badge variant="outline" className="border-slate-700 text-slate-300">Contactada</Badge>}
                        {lead.providerReply && <Badge variant="outline" className="border-slate-700 text-slate-300">Respuesta</Badge>}
                        {lead.closedAt && <Badge variant="outline" className="border-slate-700 text-slate-300">Cerrada</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {lead.requesterState !== "active" && (
                          <Button size="sm" variant="outline" onClick={() => updateState(lead.id, "active")}>
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Reactivar
                          </Button>
                        )}
                        {lead.requesterState === "active" && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => updateState(lead.id, "archived")}>
                              <Archive className="h-3.5 w-3.5 mr-1" />
                              Archivar
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => updateState(lead.id, "cancelled")}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </ConsumerDashboardLayout>
  );
};

export default ConsumerRequestsPage;
