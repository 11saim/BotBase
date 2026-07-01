import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GlobalEffects } from "./components/GlobalEffects";
import { NewLandingPage } from "./pages/NewLandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
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
  const location = useLocation();
  const [key, setKey] = useState(0);

  useEffect(() => {
    const onPop = () => setKey((k) => k + 1);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    setKey((k) => k + 1);
  }, [location.key]);

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
        <Toaster
          position="top-center"
          closeButton
          duration={3500}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "relative flex items-center gap-3 w-full h-15 rounded-md px-4 py-3.5 pr-10 shadow-[0_4px_16px_rgba(0,0,0,0.18)] border",
              title: "text-[13px] font-medium leading-snug",
              description: "text-[12px] opacity-80",
              closeButton:
                "!absolute !right-2 !top-1/2 !w-6 !h-6 [&_svg]:!w-4 [&_svg]:!h-4 !-translate-y-1/2 !left-auto !m-0 rounded-md border-0 bg-transparent text-current opacity-70 hover:opacity-100",
              success: "!bg-emerald-700 !text-white !border-emerald-800",
              error: "!bg-red-700 !text-white !border-red-800",
              warning: "!bg-amber-700 !text-white !border-amber-800",
              info: "!bg-slate-700 !text-white !border-slate-800",
            },
          }}
        />
        <GlobalEffects />
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><NewLandingPage /></PublicOnlyRoute>} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
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
