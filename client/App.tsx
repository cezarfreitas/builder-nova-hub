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
import Index from "./pages/Index";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminHero from "./pages/admin/AdminHero";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminContent from "./pages/admin/AdminContent";
import AdminBenefits from "./pages/admin/AdminBenefits";
import AdminFAQ from "./pages/admin/AdminFAQ";
import AdminForm from "./pages/admin/AdminForm";
import AdminFooter from "./pages/admin/AdminFooter";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
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
          <Route path="/admin/content" element={<AdminLayout />}>
            <Route index element={<AdminContent />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
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
