import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const CareerSelectPage = React.lazy(() => import('./pages/CareerSelectPage'));
const RoadmapPage = React.lazy(() => import('./pages/RoadmapPage'));
const SkillRoutePage = React.lazy(() => import('./pages/SkillRoutePage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const SearchResultsPage = React.lazy(() => import('./pages/SearchResultsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const RoadmapStudioPage = React.lazy(() => import('./pages/RoadmapStudioPage'));
const RoadmapStudioDetailPage = React.lazy(() => import('./pages/RoadmapStudioDetailPage'));
const ResourceHubPage = React.lazy(() => import('./pages/ResourceHubPage'));
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'));

const SIDEBAR_EXPANDED_WIDTH = '244px';
const SIDEBAR_COLLAPSED_WIDTH = '76px';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  const { loading, user } = useAuth();
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

  const workspaceRoutes = ['/workspace', '/career-paths', '/roadmaps', '/roadmap', '/skills', '/dashboard', '/search', '/profile', '/roadmap-studio', '/resources', '/community'];
  const showSidebar = workspaceRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(`${route}/`)
  );

  const routeTree = (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={user ? <Navigate to="/workspace" replace /> : <AuthPage />} />
        <Route path="/workspace" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/career-paths" element={<PrivateRoute><CareerSelectPage /></PrivateRoute>} />
        <Route path="/roadmaps" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
        <Route path="/roadmap/:pathId" element={<PrivateRoute><RoadmapPage /></PrivateRoute>} />
        <Route path="/roadmap-studio" element={<PrivateRoute><RoadmapStudioPage /></PrivateRoute>} />
        <Route path="/roadmap-studio/:roadmapId" element={<PrivateRoute><RoadmapStudioDetailPage /></PrivateRoute>} />
        <Route path="/resources" element={<PrivateRoute><ResourceHubPage /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><CommunityPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/profile/:username" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/skills/:pathId" element={<PrivateRoute><SkillRoutePage /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchResultsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );

  return (
    <div className="app-shell">
      {showSidebar && <Sidebar collapsed={sidebarCollapsed} />}
      <main
        className={
          showSidebar
            ? `min-h-screen transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                sidebarCollapsed ? 'md:pl-[76px]' : 'md:pl-[244px]'
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
            <div className="dashboard-canvas min-h-[calc(100vh-58px)] overflow-hidden">
              {routeTree}
            </div>
          </div>
        ) : (
          routeTree
        )}
      </main>
    </div>
  );
}
