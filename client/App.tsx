import { lazy, Suspense } from 'react';
import { CriticalCSS } from "./components/CriticalCSS";
import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot, type Root } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLeads = lazy(() => import("./pages/admin/AdminLeads"));
const AdminConfiguracoes = lazy(() => import("./pages/admin/AdminConfiguracoes"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminHero = lazy(() => import("./pages/admin/AdminHero"));
const AdminTestimonials = lazy(() => import("./pages/admin/AdminTestimonials"));
const AdminGallery = lazy(() => import("./pages/admin/AdminGallery"));
const AdminBenefits = lazy(() => import("./pages/admin/AdminBenefits"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminForm = lazy(() => import("./pages/admin/AdminForm"));
const AdminFooter = lazy(() => import("./pages/admin/AdminFooter"));
const AdminAbout = lazy(() => import("./pages/admin/AdminAbout"));
const AdminOrder = lazy(() => import("./pages/admin/AdminOrder"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/leads" element={<AdminLayout />}>
          <Route index element={<AdminLeads />} />
        </Route>
        <Route path="/admin/analytics" element={<AdminLayout />}>
          <Route index element={<AdminAnalytics />} />
        </Route>
        <Route path="/admin/configuracoes" element={<AdminLayout />}>
          <Route index element={<AdminConfiguracoes />} />
        </Route>
        <Route path="/admin/hero" element={<AdminLayout />}>
          <Route index element={<AdminHero />} />
        </Route>
        <Route path="/admin/benefits" element={<AdminLayout />}>
          <Route index element={<AdminBenefits />} />
        </Route>
        <Route path="/admin/testimonials" element={<AdminLayout />}>
          <Route index element={<AdminTestimonials />} />
        </Route>
        <Route path="/admin/gallery" element={<AdminLayout />}>
          <Route index element={<AdminGallery />} />
        </Route>

        <Route path="/admin/faq" element={<AdminLayout />}>
          <Route index element={<AdminFAQ />} />
        </Route>
        <Route path="/admin/form" element={<AdminLayout />}>
          <Route index element={<AdminForm />} />
        </Route>
        <Route path="/admin/footer" element={<AdminLayout />}>
          <Route index element={<AdminFooter />} />
        </Route>
        <Route path="/admin/about" element={<AdminLayout />}>
          <Route index element={<AdminAbout />} />
        </Route>
        <Route path="/admin/order" element={<AdminLayout />}>
          <Route index element={<AdminOrder />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
);

// Previne múltiplas chamadas de createRoot durante hot reloading
const container = document.getElementById("root")!;
if (!container._reactRootContainer) {
  const root = createRoot(container);
  container._reactRootContainer = root;
  root.render(<App />);
} else {
  container._reactRootContainer.render(<App />);
}
