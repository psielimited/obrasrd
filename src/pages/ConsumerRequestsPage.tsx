import { useMemo } from "react";
import { MessageSquareWarning } from "lucide-react";
import ConsumerDashboardLayout from "@/components/dashboard/ConsumerDashboardLayout";
import SectionCard from "@/components/dashboard/SectionCard";
import EmptyState from "@/components/dashboard/EmptyState";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { LEAD_STATUS_LABELS } from "@/components/dashboard/dashboard-constants";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyRequestedLeads } from "@/hooks/use-leads-data";
import type { LeadStatus } from "@/lib/leads-api";

const ConsumerRequestsPage = () => {
  const { data: requests = [], isLoading } = useMyRequestedLeads();

  const sorted = useMemo(() => [...requests].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)), [requests]);

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
                  <TableHead>Estado</TableHead>
                  <TableHead>Presupuesto</TableHead>
                  <TableHead>Nota proveedor</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((lead) => (
                  <TableRow key={lead.id} className="border-slate-800 hover:bg-slate-900/40">
                    <TableCell>
                      <p className="text-sm font-semibold text-slate-100">{lead.requesterName || "Solicitud"}</p>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{lead.message}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={lead.status} /></TableCell>
                    <TableCell>{lead.estimatedBudget || "Sin presupuesto"}</TableCell>
                    <TableCell>
                      <Input value={lead.providerReply || "Sin respuesta aun"} readOnly className="h-8 bg-slate-950 border-slate-700 text-slate-300" />
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleString()}</TableCell>
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
