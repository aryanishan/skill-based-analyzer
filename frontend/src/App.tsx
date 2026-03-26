import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import CareerSelectPage from './pages/CareerSelectPage';
import SkillInputPage from './pages/SkillInputPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar';
import LoadingSpinner from './components/LoadingSpinner';
import { useLocation } from 'react-router-dom';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner />;

  const showSidebar = location.pathname !== '/auth';

  return (
    <div className="app-shell">
      {showSidebar && <Sidebar />}
      <main className={showSidebar ? 'min-h-screen pt-16 md:pl-[96px] xl:pl-[292px]' : 'min-h-screen'}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<PrivateRoute><CareerSelectPage /></PrivateRoute>} />
          <Route path="/skills/:pathId" element={<PrivateRoute><SkillInputPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
