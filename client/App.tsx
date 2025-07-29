import { lazy, Suspense } from "react";
import { CriticalCSS } from "./components/CriticalCSS";
import { CSSOptimizer } from "./components/CSSOptimizer";
import { PerformanceOptimizer } from "./components/PerformanceOptimizer";
import { ReactContextTest, ContextTestDisplay } from "./components/ReactContextTest";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot, type Root } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MetaTrackingProvider } from "./contexts/MetaTrackingContext";

// Extend HTMLElement type to include our root container property
declare global {
  interface HTMLElement {
    _reactRootContainer?: Root;
  }
}

// Critical page (não lazy)
import Index from "./pages/Index";

// Lazy load admin pages para melhorar performance inicial
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminConfiguracoes = lazy(
  () => import("./pages/admin/AdminConfiguracoes"),
);
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminBenefits = lazy(() => import("./pages/admin/AdminBenefits"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminForm = lazy(() => import("./pages/admin/AdminForm"));
const AdminFooter = lazy(() => import("./pages/admin/AdminFooter"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Componente de proteção de rotas
const ProtectedRoute = lazy(() =>
  import("./components/ProtectedRoute").then((module) => ({
    default: module.ProtectedRoute,
  })),
);

// Loading component
const PageLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
      <p className="text-white">Carregando...</p>
    </div>
  </div>
);

const App = () => (
  <PerformanceOptimizer>
    <BrowserRouter>
      <CriticalCSS />
      <CSSOptimizer />
      <MetaTrackingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<PageLoading />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminDashboard />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/leads"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminLeads />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/analytics"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminAnalytics />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/configuracoes"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminConfiguracoes />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/hero"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminHero />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/benefits"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminBenefits />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/testimonials"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminTestimonials />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/gallery"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminGallery />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/faq"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminFAQ />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/form"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminForm />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/footer"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminFooter />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/admin/about"
            element={
              <Suspense fallback={<PageLoading />}>
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<PageLoading />}>
                  <AdminAbout />
                </Suspense>
              }
            />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoading />}>
                <NotFound />
              </Suspense>
            }
          />
          </Routes>
        </TooltipProvider>
      </MetaTrackingProvider>
    </BrowserRouter>
  </PerformanceOptimizer>
);

export default App;

// Registra service worker para desabilitar cache
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("✅ Service Worker registrado para desabilitar cache");
      })
      .catch((error) => {
        console.log("❌ Falha ao registrar Service Worker:", error);
      });
  });
}

// Previne múltiplas chamadas de createRoot durante hot reloading
const container = document.getElementById("root")!;
if (!container._reactRootContainer) {
  const root = createRoot(container);
  container._reactRootContainer = root;
  root.render(<App />);
} else {
  container._reactRootContainer.render(<App />);
}
