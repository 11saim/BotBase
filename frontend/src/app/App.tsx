import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { GlobalEffects } from "./components/GlobalEffects";
import { NewLandingPage } from "./pages/NewLandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardShell } from "./dashboard/DashboardShell";
import { DashboardHomePage } from "./dashboard/DashboardHomePage";
import { DashboardSettingsPage } from "./dashboard/DashboardSettingsPage";
import { BotCreationWizardPage } from "./dashboard/BotCreationWizardPage";
import { DashboardBotDetailPage } from "./dashboard/DashboardBotDetailPage";

function LegacyBotRedirect() {
  const { id } = useParams();
  return <Navigate to={`/dashboard/bots/${id ?? ""}`} replace />;
}

function LegacySettingsRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (params.get("tab") === "api-keys") {
    return <Navigate to="/dashboard/settings" replace />;
  }
  return <Navigate to={`/dashboard/settings${location.search}`} replace />;
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
          <Route path="settings" element={<DashboardSettingsPage />} />
          <Route path="bots/new" element={<BotCreationWizardPage />} />
          <Route path="bots/:botId" element={<DashboardBotDetailPage />} />
        </Route>
        <Route
          path="/unified-dashboard"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/settings" element={<LegacySettingsRedirect />} />
        <Route
          path="/create-bot"
          element={<Navigate to="/dashboard/bots/new" replace />}
        />
        <Route path="/bot/:id" element={<LegacyBotRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
