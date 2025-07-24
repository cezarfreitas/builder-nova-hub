import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminHero from "./pages/admin/AdminHero";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminGallery from "./pages/admin/AdminGallery";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
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
        <Route path="/admin/testimonials" element={<AdminLayout />}>
          <Route index element={<AdminTestimonials />} />
        </Route>
        <Route path="/admin/gallery" element={<AdminLayout />}>
          <Route index element={<AdminGallery />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
