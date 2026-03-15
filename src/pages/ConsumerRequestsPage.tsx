import { useMemo, useState } from "react";
import { MessageSquare, MessageSquareWarning, RotateCcw, XCircle, Archive } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { useDashboardRealtimeSync } from "@/hooks/use-dashboard-realtime-sync";

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

type RequestPresetFilter = "all" | "today" | "week" | "archived";

const PRESET_LABELS: Record<RequestPresetFilter, string> = {
  all: "Todas",
  today: "Hoy",
  week: "7 dias",
  archived: "Archivadas",
};

const ConsumerRequestsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: requests = [], isLoading } = useMyRequestedLeads();
  useDashboardRealtimeSync({ includeLeads: false, includeThread: false });
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [preset, setPreset] = useState<RequestPresetFilter>("all");

  const sorted = useMemo(
    () =>
      [...requests]
        .filter((lead) => {
          const createdAt = Date.parse(lead.createdAt);
          const now = new Date();
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
          const weekStart = now.getTime() - 7 * 24 * 60 * 60 * 1000;

          const matchesPreset =
            preset === "all" ||
            (preset === "today" && createdAt >= todayStart) ||
            (preset === "week" && createdAt >= weekStart) ||
            (preset === "archived" && lead.requesterState === "archived");
          if (!matchesPreset) return false;

          if (!showOnlyUnread) return true;
          return Boolean(lead.lastMessageAt) &&
            (!lead.requesterLastReadAt ||
              Date.parse(lead.lastMessageAt) > Date.parse(lead.requesterLastReadAt));
        })
        .sort((a, b) => {
          const aActivityAt = a.lastMessageAt || a.createdAt;
          const bActivityAt = b.lastMessageAt || b.createdAt;
          return Date.parse(bActivityAt) - Date.parse(aActivityAt);
        }),
    [preset, requests, showOnlyUnread],
  );

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
          <div className="mb-3 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PRESET_LABELS) as RequestPresetFilter[]).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={preset === option ? "accent" : "outline"}
                  onClick={() => setPreset(option)}
                >
                  {PRESET_LABELS[option]}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between gap-2 rounded-md border border-slate-800 px-3 py-2">
              <span className="text-sm text-slate-300">Solo no leidos</span>
              <Switch checked={showOnlyUnread} onCheckedChange={setShowOnlyUnread} />
            </div>
            <p className="text-xs text-slate-500">Mostrando {sorted.length} solicitudes</p>
          </div>
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
                  <TableHead>Mensajes</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((lead) => {
                  const unreadForRequester =
                    Boolean(lead.lastMessageAt) &&
                    (!lead.requesterLastReadAt ||
                      Date.parse(lead.lastMessageAt) > Date.parse(lead.requesterLastReadAt));

                  return (
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
                        <div className="space-y-1">
                          <Button size="sm" variant="outline" onClick={() => navigate(`/lead/${lead.id}/chat`)}>
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Chat
                          </Button>
                          <p className="text-[11px] text-slate-500 line-clamp-2">{lead.lastMessagePreview || "Sin mensajes"}</p>
                          {unreadForRequester && <Badge variant="outline" className="border-accent/40 text-accent w-fit">No leido</Badge>}
                        </div>
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
                  );
                })}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </ConsumerDashboardLayout>
  );
};

export default ConsumerRequestsPage;
