
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AlertProvider } from "./context/AlertContext";
import Navigation from "./components/Navigation";
import ProtectedRoute from "./components/ProtectedRoute";
import OAuthHandler from "./components/OAuthHandler";
import Dashboard from "./pages/Dashboard";
import Protocol from "./pages/Protocol";
import Statistics from "./pages/Statistics";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AlertProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <div className="flex-1">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <OAuthHandler>
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      </OAuthHandler>
                    }
                  />
                  <Route
                    path="/protocol"
                    element={
                      <ProtectedRoute>
                        <Protocol />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/stats"
                    element={
                      <ProtectedRoute requireAdmin>
                        <Statistics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute requireSuperAdmin>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </BrowserRouter>
        </AlertProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
