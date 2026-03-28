import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CareerSelectPage from './pages/CareerSelectPage';
import RoadmapPage from './pages/RoadmapPage';
import SkillInputPage from './pages/SkillInputPage';
import DashboardPage from './pages/DashboardPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import { useLocation } from 'react-router-dom';

const SIDEBAR_EXPANDED_WIDTH = '292px';
const SIDEBAR_COLLAPSED_WIDTH = '88px';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('sidebar-collapsed');
    if (stored === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  if (loading) return <LoadingSpinner />;

  const showSidebar = location.pathname !== '/auth';

  return (
    <div className="app-shell">
      {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}
      <main
        className={
          showSidebar
            ? `min-h-screen transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                sidebarCollapsed ? 'md:pl-[88px]' : 'md:pl-[292px]'
              }`
            : 'min-h-screen'
        }
        style={
          showSidebar
            ? {
                ['--sidebar-expanded-width' as any]: SIDEBAR_EXPANDED_WIDTH,
                ['--sidebar-collapsed-width' as any]: SIDEBAR_COLLAPSED_WIDTH,
              }
            : undefined
        }
      >
        {showSidebar ? (
          <div className="dashboard-frame min-h-screen">
            <Navbar collapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(current => !current)} />
            <div className="dashboard-canvas min-h-[calc(100vh-76px)] overflow-hidden">
              <Routes>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/career-paths" element={<PrivateRoute><CareerSelectPage /></PrivateRoute>} />
                <Route path="/roadmaps" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
                <Route path="/roadmap/:pathId" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
                <Route path="/skills/:pathId" element={<PrivateRoute><SkillInputPage /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/career-paths" element={<PrivateRoute><CareerSelectPage /></PrivateRoute>} />
            <Route path="/roadmaps" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
            <Route path="/roadmap/:pathId" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
            <Route path="/skills/:pathId" element={<PrivateRoute><SkillInputPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
    </div>
  );
}
