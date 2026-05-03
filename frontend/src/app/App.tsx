import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalEffects } from './components/GlobalEffects';
import { NewLandingPage } from './pages/NewLandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnifiedDashboard } from './pages/UnifiedDashboard';
import { CreateBotPage } from './pages/CreateBotPage';
import { BotDetailPage } from './pages/BotDetailPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <GlobalEffects />
      <Routes>
        <Route path="/" element={<NewLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<LoginPage />} />
        <Route path="/dashboard" element={<UnifiedDashboard />} />
        <Route path="/unified-dashboard" element={<UnifiedDashboard />} />
        <Route path="/create-bot" element={<CreateBotPage />} />
        <Route path="/bot/:id" element={<BotDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}