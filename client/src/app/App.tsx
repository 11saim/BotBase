import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import { GlobalEffects } from "./components/GlobalEffects";
import { NewLandingPage } from "./pages/NewLandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardShell } from "./pages/dashboard/DashboardShell";
import { DashboardHomePage } from "./pages/dashboard/DashboardHomePage";
import { DashboardPlanUsagePage } from "./pages/dashboard/DashboardPlanUsagePage";
import { DashboardBotDetailPage } from "./pages/dashboard/DashboardBotDetailPage";

function LegacyBotRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/bots/${id ?? ""}`} replace />;
}

function LegacySettingsRedirect() {
  return <Navigate to="/dashboard/usage" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalEffects />
      <Routes>
        <Route path="/" element={<NewLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardShell />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="usage" element={<DashboardPlanUsagePage />} />
          <Route path="settings" element={<Navigate to="/dashboard/usage" replace />} />
          <Route path="bots/new" element={<Navigate to="/dashboard?create=1" replace />} />
          <Route path="bots/:botId" element={<DashboardBotDetailPage />} />
        </Route>
        <Route
          path="/unified-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/settings" element={<LegacySettingsRedirect />} />
        <Route
          path="/create-bot"
          element={<Navigate to="/dashboard?create=1" replace />}
        />
        <Route path="/bot/:id" element={<LegacyBotRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
