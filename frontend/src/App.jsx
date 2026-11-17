import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import ProblemsListPage from './pages/ProblemsListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import AdaptiveInterviewPage from './pages/AdaptiveInterviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/problems" element={<ProblemsListPage />} />
              <Route path="/problems/:id" element={<ProblemDetailPage />} />
              <Route path="/interview" element={<AdaptiveInterviewPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
