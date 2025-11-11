import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/routing/ProtectedRoute";

import Index from "./pages/Index";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import AnalyzeComplete from "./pages/AnalyzeComplete";
import History from "./pages/History";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import UploadTrack from "./pages/UploadTrack";
import SignUp from "./pages/SignUp";
import TrackUploaded from "./pages/TrackUploaded";
import AnalyzingTrack from "./pages/AnalyzingTrack";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<UploadTrack />} />
            <Route path="/login" element={<UploadTrack />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/process" element={<TrackUploaded />} />
            <Route path="/about" element={<About />} />

            {/* Private */}
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
             <Route
              path="/analyzing/:id"
              element={
                <ProtectedRoute>
                  <AnalyzingTrack />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis/:id"
              element={
                <ProtectedRoute>
                  <AnalyzeComplete />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
