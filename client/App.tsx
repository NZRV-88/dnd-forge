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
import CharacterView from "./pages/CharacterView";
import LoginPage from "./pages/auth/LoginPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
                            <Route path="/login" element={<LoginPage />} />
                            <Route
                                path="/characters"
                                element={
                                    <ProtectedRoute>
                                        <Characters />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/campaigns" element={<Campaigns />} />
                            <Route path="/graveyard" element={<Graveyard />} />
                            <Route
                                path="/create"
                                element={
                                    <ProtectedRoute>
                                        <Start />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/create/:id"
                                element={
                                    <ProtectedRoute>
                                        <Start />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/start"
                                element={
                                    <ProtectedRoute>
                                        <Start />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/abilities"
                                element={
                                    <ProtectedRoute>
                                        <AbilitiesPick />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/equipment"
                                element={
                                    <ProtectedRoute>
                                        <EquipmentPick />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/race"
                                element={
                                    <ProtectedRoute>
                                        <Race />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/class"
                                element={
                                    <ProtectedRoute>
                                        <ClassPick />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/background"
                                element={
                                    <ProtectedRoute>
                                        <BackgroundPick />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/create/:id/summary"
                                element={
                                    <ProtectedRoute>
                                        <Summary />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/characters/:id" element={<CharacterView />} />
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
