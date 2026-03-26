import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CareerSelectPage from './pages/CareerSelectPage';
import SkillInputPage from './pages/SkillInputPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  const { loading } = useAuth();
  if (loading) return <LoadingSpinner />;

  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<PrivateRoute><CareerSelectPage /></PrivateRoute>} />
        <Route path="/skills/:pathId" element={<PrivateRoute><SkillInputPage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
