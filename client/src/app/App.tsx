import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GlobalEffects } from "./components/GlobalEffects";
import { NewLandingPage } from "./pages/NewLandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import SeeAllBots from "./pages/SeeAllBots";
import { DashboardShell } from "./pages/dashboard/DashboardShell";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { DashboardPlanUsagePage } from "./pages/dashboard/DashboardPlanUsagePage";
import { DashboardBotDetailPage } from "./pages/dashboard/DashboardBotDetailPage";
import { DashboardAnalyticsPage } from "./pages/dashboard/DashboardAnalyticsPage";
import { DashboardRecentConversationsPage } from "./pages/dashboard/DashboardRecentConversationsPage";
import { useAuth } from "../hooks/useAuth";

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function LegacyBotRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/bots/${id ?? ""}`} replace />;
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <GlobalEffects />
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><NewLandingPage /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
          <Route path="/forgot-password" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

          <Route path="/dashboard" element={<PrivateRoute><DashboardShell /></PrivateRoute>}>
            <Route index element={<DashboardHomePage />} />
            <Route path="usage" element={<DashboardPlanUsagePage />} />
            <Route path="analytics" element={<DashboardAnalyticsPage />} />
            <Route path="recent-conversations" element={<DashboardRecentConversationsPage />} />
            <Route path="bots/new" element={<Navigate to="/dashboard?create=1" replace />} />
            <Route path="bots" element={<SeeAllBots />} />
            <Route path="bots/:botId" element={<DashboardBotDetailPage />} />
          </Route>

          <Route path="/unified-dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/create-bot" element={<Navigate to="/dashboard?create=1" replace />} />
          <Route path="/bot/:id" element={<LegacyBotRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
