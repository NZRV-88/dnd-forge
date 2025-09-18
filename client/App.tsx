import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Layout from "@/components/Layout";
import Create from "./pages/Create";
import Race from "./pages/create/Race";
import ClassPick from "./pages/create/Class";
import BackgroundPick from "./pages/create/Background";
import Characters from "./pages/Characters";
import Campaigns from "./pages/Campaigns";
import Graveyard from "./pages/Graveyard";
import { CharacterProvider } from "@/store/character";
import Start from "./pages/create/Start";
import AbilitiesPick from "./pages/create/Abilities";
import EquipmentPick from "./pages/create/Equipment";
import Summary from "./pages/create/Summary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <CharacterProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create/race" element={<Race />} />
              <Route path="/create/class" element={<ClassPick />} />
              <Route path="/create/background" element={<BackgroundPick />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/graveyard" element={<Graveyard />} />
              <Route path="/create" element={<Start />} />
              <Route path="/create/abilities" element={<AbilitiesPick />} />
              <Route path="/create/equipment" element={<EquipmentPick />} />
              <Route path="/create/summary" element={<Summary />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </CharacterProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
