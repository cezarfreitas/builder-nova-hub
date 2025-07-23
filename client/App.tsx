import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLeads from "./pages/admin/AdminLeads";
import NotFound from "./pages/NotFound";

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="leads" element={<AdminLeads />} />
          {/* Manter outras rotas temporariamente redirecionando para o admin antigo */}
          <Route path="analytics" element={<Admin />} />
          <Route path="hero" element={<Admin />} />
          <Route path="benefits" element={<Admin />} />
          <Route path="testimonials" element={<Admin />} />
          <Route path="gallery" element={<Admin />} />
          <Route path="stats" element={<Admin />} />
          <Route path="faq" element={<Admin />} />
          <Route path="configuracoes" element={<Admin />} />
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
