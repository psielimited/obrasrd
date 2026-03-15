import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import PhasePage from "./pages/PhasePage";
import ProviderProfile from "./pages/ProviderProfile";
import MaterialsPage from "./pages/MaterialsPage";
import ProjectBuilder from "./pages/ProjectBuilder";
import PublishService from "./pages/PublishService";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ProviderDashboard from "./pages/ProviderDashboard";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TopNav />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/fase/:slug" element={<PhasePage />} />
          <Route path="/proveedor/:id" element={<ProviderProfile />} />
          <Route path="/materiales" element={<MaterialsPage />} />
          <Route path="/proyectos" element={<ProjectBuilder />} />
          <Route path="/publicar" element={<PublishService />} />
          <Route path="/auth" element={<AuthPage />} />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
