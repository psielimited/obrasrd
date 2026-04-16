import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/use-profile-data";
import { getDataQualityReport } from "@/lib/reports/data-quality-report";

const InternalDataQualityPage = () => {
  const [leadLookbackDays, setLeadLookbackDays] = useState(90);
  const [leadLimit, setLeadLimit] = useState(2000);
  const { data: profile, isLoading: isProfileLoading } = useMyProfile();
  const {
    data: report,
    isLoading: isReportLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["internal", "data-quality-report", leadLookbackDays, leadLimit],
    queryFn: () => getDataQualityReport({ leadLookbackDays, leadLimit }),
  });

  const summary = useMemo(() => {
    if (!report) return null;
    return [
      { label: "Missing taxonomy", value: report.providersMissingTaxonomyBindings.length },
      { label: "Missing location", value: report.providersMissingLocation.length },
      { label: "Missing portfolio", value: report.providersMissingPortfolio.length },
      { label: "Legacy only", value: report.providersLegacyCategoryOnly.length },
      { label: "Unmapped request terms", value: report.projectRequestsUnmappedNormalizedTerms.length },
      { label: "Verification inconsistencies", value: report.providersVerificationInconsistencies.length },
      { label: "Featured + missing structured data", value: report.featuredPlacementMissingStructuredData.length },
    ];
  }, [report]);

  if (!import.meta.env.DEV) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Esta ruta interna solo esta disponible en modo desarrollo.
          </p>
          <Button asChild variant="ghost" className="mt-3">
            <Link to="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isProfileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando acceso interno...</p>
      </div>
    );
  }

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-semibold text-foreground">Acceso restringido</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Este panel interno requiere rol admin.
          </p>
          <Button asChild variant="ghost" className="mt-3">
            <Link to="/dashboard">Ir al dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="px-4 py-6">
        <div className="container mx-auto max-w-6xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Button asChild variant="ghost" size="sm" className="mb-1">
                <Link to="/dashboard">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-black tracking-tight text-foreground">Internal Data Quality</h1>
              <p className="text-xs text-muted-foreground">
                Taxonomia, perfilado de proveedores y consistencia operativa.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground" htmlFor="dq-window">
                Ventana leads
              </label>
              <select
                id="dq-window"
                value={leadLookbackDays}
                onChange={(event) => setLeadLookbackDays(Number(event.target.value))}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <option value={30}>30d</option>
                <option value={60}>60d</option>
                <option value={90}>90d</option>
                <option value={180}>180d</option>
                <option value={365}>365d</option>
              </select>
              <label className="text-xs text-muted-foreground" htmlFor="dq-limit">
                Limite leads
              </label>
              <select
                id="dq-limit"
                value={leadLimit}
                onChange={(event) => setLeadLimit(Number(event.target.value))}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              >
                <option value={500}>500</option>
                <option value={1000}>1,000</option>
                <option value={2000}>2,000</option>
                <option value={5000}>5,000</option>
                <option value={10000}>10,000</option>
              </select>
              {report && (
                <Badge variant="outline">
                  Generado: {new Date(report.generatedAt).toLocaleString()}
                </Badge>
              )}
              <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                {isFetching ? "Actualizando..." : "Refrescar"}
              </Button>
            </div>
          </div>

          {isReportLoading && (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">Construyendo reporte...</p>
            </Card>
          )}

          {isError && (
            <Card className="p-4">
              <p className="text-sm font-semibold text-foreground">No se pudo construir el reporte.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Error desconocido."}
              </p>
            </Card>
          )}

          {summary && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {summary.map((item) => (
                <Card key={item.label} className="p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-2xl font-black">{item.value}</p>
                </Card>
              ))}
            </div>
          )}

          {report && (
            <>
              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Providers Missing Taxonomy Bindings</p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Legacy</th>
                      <th className="pb-2">Primary IDs</th>
                      <th className="pb-2">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.providersMissingTaxonomyBindings.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">
                          <div className="font-semibold">{item.providerName}</div>
                          <div className="text-muted-foreground">{item.providerId}</div>
                        </td>
                        <td className="py-2">{item.categorySlug}</td>
                        <td className="py-2">
                          D:{item.primaryDisciplineId ?? "-"} S:{item.primaryServiceId ?? "-"}
                        </td>
                        <td className="py-2">
                          services={item.serviceCount} work_types={item.workTypeCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Providers Missing Location</p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">City</th>
                      <th className="pb-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.providersMissingLocation.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">{item.providerName}</td>
                        <td className="py-2">{item.city ?? "-"}</td>
                        <td className="py-2">{item.location ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Providers Missing Portfolio</p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Images</th>
                      <th className="pb-2">Projects</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.providersMissingPortfolio.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">{item.providerName}</td>
                        <td className="py-2">{item.portfolioImageCount}</td>
                        <td className="py-2">{item.portfolioProjectCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Providers Still Legacy-Only</p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Legacy Category</th>
                      <th className="pb-2">Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.providersLegacyCategoryOnly.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">{item.providerName}</td>
                        <td className="py-2">{item.categorySlug}</td>
                        <td className="py-2">{item.phaseId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Project Requests With Unmapped Terms</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Se muestra hash del termino normalizado para evitar exponer texto libre.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Leads escaneados: {report.scannedLeadCount} | Ventana: {report.leadLookbackDays} dias | Limite:{" "}
                  {report.leadLimit}
                </p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Hash</th>
                      <th className="pb-2">Requests</th>
                      <th className="pb-2">Missing Structured</th>
                      <th className="pb-2">Token/Chars</th>
                      <th className="pb-2">Latest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.projectRequestsUnmappedNormalizedTerms.slice(0, 100).map((item) => (
                      <tr key={item.hash} className="border-t border-border">
                        <td className="py-2 font-mono">{item.hash}</td>
                        <td className="py-2">{item.requestCount}</td>
                        <td className="py-2">{item.missingStructuredRequestCount}</td>
                        <td className="py-2">
                          {item.tokenCount} / {item.characterCount}
                        </td>
                        <td className="py-2">{new Date(item.latestCreatedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">Provider Verification Inconsistencies</p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Verified</th>
                      <th className="pb-2">Trust Snapshot</th>
                      <th className="pb-2">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.providersVerificationInconsistencies.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">{item.providerName}</td>
                        <td className="py-2">{String(item.verified)}</td>
                        <td className="py-2">
                          pv={String(item.trustProviderVerified)} ic={String(item.trustIdentityConfirmed)}{" "}
                          pof={String(item.trustPortfolioValidated)} act={String(item.trustActiveThisMonth)}
                        </td>
                        <td className="py-2">{item.issues.join(" | ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>

              <Card className="overflow-x-auto p-4">
                <p className="text-sm font-semibold text-foreground">
                  Featured Placement Interactions With Missing Structured Data
                </p>
                <table className="mt-3 w-full text-left text-xs">
                  <thead className="text-muted-foreground">
                    <tr>
                      <th className="pb-2">Provider</th>
                      <th className="pb-2">Missing Taxonomy</th>
                      <th className="pb-2">Missing Location</th>
                      <th className="pb-2">Missing Portfolio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.featuredPlacementMissingStructuredData.slice(0, 100).map((item) => (
                      <tr key={item.providerId} className="border-t border-border">
                        <td className="py-2">{item.providerName}</td>
                        <td className="py-2">{String(item.missingTaxonomyBindings)}</td>
                        <td className="py-2">{String(item.missingLocation)}</td>
                        <td className="py-2">{String(item.missingPortfolio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternalDataQualityPage;
