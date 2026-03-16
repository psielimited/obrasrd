import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CircleHelp, Sparkles } from "lucide-react";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyProfile } from "@/hooks/use-profile-data";
import { usePublicProviderPlans } from "@/hooks/use-provider-plan-data";

const PLAN_ORDER = ["free", "pro", "elite"];

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

const quotaLabel = (quota: number | null) => (quota === null ? "Leads ilimitados" : `${quota} leads / mes`);

const PricingPage = () => {
  const { user } = useAuthSession();
  const { data: profile } = useMyProfile();
  const { data: plans = [], isLoading, isError } = usePublicProviderPlans();

  const sortedPlans = [...plans].sort((a, b) => {
    const aIndex = PLAN_ORDER.indexOf(a.code);
    const bIndex = PLAN_ORDER.indexOf(b.code);
    if (aIndex === -1 || bIndex === -1) return a.priceUsd - b.priceUsd;
    return aIndex - bIndex;
  });

  const ctaHref = !user ? "/auth" : profile?.role === "provider" ? "/dashboard/proveedor" : "/perfil";
  const ctaLabel = !user ? "Crear cuenta" : profile?.role === "provider" ? "Gestionar mi plan" : "Quiero ofrecer servicios";

  return (
    <div className="min-h-screen pb-16 md:pb-0 bg-slate-950 text-slate-100">
      <section className="px-4 pt-16 pb-10 md:pt-24 md:pb-16 border-b border-slate-800/80 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_40%)]">
        <div className="container max-w-6xl mx-auto">
          <Badge variant="outline" className="border-slate-700 text-slate-200 bg-slate-900/70">
            Planes para proveedores
          </Badge>
          <h1 className="mt-4 text-3xl md:text-5xl font-black tracking-tight">Escala tu negocio en ObrasRD</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Elige el plan que mejor se ajusta a tu flujo de leads, visibilidad y soporte. Todos los precios estan en USD.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to={ctaHref}>
              <Button className="font-semibold">{ctaLabel}</Button>
            </Link>
            <Link to="/buscar">
              <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Ver marketplace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:py-14">
        <div className="container max-w-6xl mx-auto">
          {isLoading && <p className="text-sm text-slate-300">Cargando planes...</p>}
          {isError && <p className="text-sm text-rose-300">No pudimos cargar los planes en este momento.</p>}
          {!isLoading && !isError && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {sortedPlans.map((plan) => {
                const isPopular = plan.code === "pro";
                return (
                  <Card
                    key={plan.code}
                    className={`rounded-2xl border ${
                      isPopular ? "border-cyan-400/60 bg-slate-900/90" : "border-slate-800 bg-slate-900/70"
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-100">{plan.name}</CardTitle>
                        {isPopular && (
                          <Badge className="gap-1 bg-cyan-500 text-cyan-950 hover:bg-cyan-400">
                            <Sparkles className="h-3 w-3" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-slate-300">{quotaLabel(plan.monthlyLeadQuota)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-3xl font-black text-slate-100">
                        {formatUsd(plan.priceUsd)}
                        <span className="ml-1 text-sm font-medium text-slate-400">/mes</span>
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2 text-slate-200">
                          <Check className="h-4 w-4 text-emerald-400" />
                          {plan.monthlyLeadQuota === null ? "Solicitudes ilimitadas" : `Hasta ${plan.monthlyLeadQuota} leads mensuales`}
                        </li>
                        <li className="flex items-center gap-2 text-slate-200">
                          <Check className="h-4 w-4 text-emerald-400" />
                          {plan.featuredSlots} espacios de perfil destacado
                        </li>
                        <li className="flex items-center gap-2 text-slate-200">
                          <Check className="h-4 w-4 text-emerald-400" />
                          Soporte {plan.prioritySupport ? "prioritario" : "estandar"}
                        </li>
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Link to={ctaHref} className="w-full">
                        <Button className="w-full" variant={isPopular ? "default" : "secondary"}>
                          {user ? "Elegir plan" : "Empezar ahora"}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-14">
        <div className="container max-w-6xl mx-auto">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-300">
                <tr className="text-left">
                  <th className="px-4 py-3 font-semibold">Caracteristica</th>
                  {sortedPlans.map((plan) => (
                    <th key={plan.code} className="px-4 py-3 font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">Precio mensual</td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.code} className="px-4 py-3 text-slate-100">
                      {formatUsd(plan.priceUsd)}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">Leads al mes</td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.code} className="px-4 py-3 text-slate-100">
                      {plan.monthlyLeadQuota === null ? "Ilimitados" : plan.monthlyLeadQuota}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">Perfiles destacados</td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.code} className="px-4 py-3 text-slate-100">
                      {plan.featuredSlots}
                    </td>
                  ))}
                </tr>
                <tr className="border-t border-slate-800">
                  <td className="px-4 py-3 text-slate-400">Soporte prioritario</td>
                  {sortedPlans.map((plan) => (
                    <td key={plan.code} className="px-4 py-3 text-slate-100">
                      {plan.prioritySupport ? "Si" : "No"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-slate-100">Transparencia total</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-300">
                Sin contratos anuales. Puedes cambiar o cancelar tu plan cuando lo necesites.
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-800 bg-slate-900/60">
              <CardHeader>
                <CardTitle className="text-base text-slate-100 inline-flex items-center gap-2">
                  <CircleHelp className="h-4 w-4 text-cyan-300" />
                  Preguntas frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-slate-300">
                Tu cuota de leads se reinicia cada mes calendario. Los precios estan publicados en USD.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
