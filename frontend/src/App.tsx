import React from 'react';
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
      <main className={showSidebar ? 'min-h-screen pt-4 md:pl-[96px] xl:pl-[292px]' : 'min-h-screen'}>
        {showSidebar ? (
          <div className="dashboard-frame min-h-screen px-4 pb-4 md:px-5 md:pb-5">
            <Navbar />
            <div className="dashboard-canvas mt-4 min-h-[calc(100vh-7rem)] overflow-hidden rounded-[10px]">
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
