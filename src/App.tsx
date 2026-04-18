import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import RequireAuth from "./components/RequireAuth";
import { QUERY_STALE_TIMES } from "@/lib/query-options";
import { LEGACY_PUBLIC_ROUTE_ALIASES, PUBLIC_ROUTES } from "@/lib/public-ia";

const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));

const Index = lazy(() => import("./pages/Index"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const PhasePage = lazy(() => import("./pages/PhasePage"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile"));
const MaterialsPage = lazy(() => import("./pages/MaterialsPage"));
const ProjectBuilder = lazy(() => import("./pages/ProjectBuilder"));
const PublishService = lazy(() => import("./pages/PublishService"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const JourneyGuidesPage = lazy(() => import("./pages/JourneyGuidesPage"));
const JourneyGuidePage = lazy(() => import("./pages/JourneyGuidePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const ProviderProfileEditorPage = lazy(() => import("./pages/ProviderProfileEditorPage"));
const ProviderLeadsPage = lazy(() => import("./pages/ProviderLeadsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ConsumerDashboardPage = lazy(() => import("./pages/ConsumerDashboardPage"));
const ConsumerRequestsPage = lazy(() => import("./pages/ConsumerRequestsPage"));
const ConsumerSavedProvidersPage = lazy(() => import("./pages/ConsumerSavedProvidersPage"));
const ConsumerCompareProvidersPage = lazy(() => import("./pages/ConsumerCompareProvidersPage"));
const DashboardHomeRedirect = lazy(() => import("./pages/DashboardHomeRedirect"));
const LeadThreadPage = lazy(() => import("./pages/LeadThreadPage"));
const InternalDataQualityPage = lazy(() => import("./pages/InternalDataQualityPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_STALE_TIMES.short,
      gcTime: 30 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
    },
  },
});

const LegacyRouteRedirect = ({ to }: { to: string }) => {
  const location = useLocation();
  return <Navigate replace to={`${to}${location.search}${location.hash}`} />;
};

const LegacyKnowledgeDetailRedirect = () => {
  const { slug = "" } = useParams();
  const location = useLocation();
  return <Navigate replace to={`${PUBLIC_ROUTES.conocimiento}/${slug}${location.search}${location.hash}`} />;
};

const AppContent = () => {
  const location = useLocation();
  const isDashboardShellRoute =
    location.pathname.startsWith("/dashboard") ||
    location.pathname === "/notificaciones" ||
    location.pathname.startsWith("/lead/");

  return (
    <>
      {!isDashboardShellRoute && <TopNav />}
      <Suspense fallback={<div className="px-4 py-10 text-center text-sm text-slate-400">Cargando...</div>}>
        <Routes>
          <Route path={PUBLIC_ROUTES.home} element={<Index />} />
          <Route path={PUBLIC_ROUTES.directorio} element={<SearchPage />} />
          {/* Migration note: keep aliases to avoid breaking existing shared links and indexed URLs. */}
          <Route path={LEGACY_PUBLIC_ROUTE_ALIASES.buscar} element={<LegacyRouteRedirect to={PUBLIC_ROUTES.directorio} />} />
          <Route path="/fase/:slug" element={<PhasePage />} />
          <Route path="/proveedor/:id" element={<ProviderProfile />} />
          <Route path="/materiales" element={<MaterialsPage />} />
          <Route path="/proyectos" element={<ProjectBuilder />} />
          <Route path={PUBLIC_ROUTES.empresas} element={<PublishService />} />
          <Route path={LEGACY_PUBLIC_ROUTE_ALIASES.publicar} element={<LegacyRouteRedirect to={PUBLIC_ROUTES.empresas} />} />
          <Route path="/precios" element={<PricingPage />} />
          <Route path={PUBLIC_ROUTES.conocimiento} element={<JourneyGuidesPage />} />
          <Route path={`${PUBLIC_ROUTES.conocimiento}/:slug`} element={<JourneyGuidePage />} />
          <Route path={LEGACY_PUBLIC_ROUTE_ALIASES.guias} element={<LegacyRouteRedirect to={PUBLIC_ROUTES.conocimiento} />} />
          <Route path={`${LEGACY_PUBLIC_ROUTE_ALIASES.guias}/:slug`} element={<LegacyKnowledgeDetailRedirect />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardHomeRedirect />
              </RequireAuth>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/proveedor"
            element={
              <RequireAuth>
                <ProviderDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/proveedor/perfil"
            element={
              <RequireAuth>
                <ProviderProfileEditorPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/cliente"
            element={
              <RequireAuth>
                <ConsumerDashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/cliente/solicitudes"
            element={
              <RequireAuth>
                <ConsumerRequestsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/cliente/guardados"
            element={
              <RequireAuth>
                <ConsumerSavedProvidersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/cliente/comparar"
            element={
              <RequireAuth>
                <ConsumerCompareProvidersPage />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/leads"
            element={
              <RequireAuth>
                <ProviderLeadsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/notificaciones"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/lead/:id/chat"
            element={
              <RequireAuth>
                <LeadThreadPage />
              </RequireAuth>
            }
          />
          {import.meta.env.DEV && (
            <Route
              path="/internal/data-quality"
              element={
                <RequireAuth>
                  <InternalDataQualityPage />
                </RequireAuth>
              }
            />
          )}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!isDashboardShellRoute && <BottomNav />}
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Suspense fallback={null}>
        <Toaster />
        <Sonner />
      </Suspense>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
