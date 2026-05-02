import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';
import JenkinsPanel from './pages/JenkinsPanel';
import DockerPanel from './pages/DockerPanel';
import Monitoring from './pages/Monitoring';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Give local storage a moment to load if needed, but context is sync
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<ChatBot />} />
            <Route path="jenkins" element={
              <ProtectedRoute requireAdmin>
                <JenkinsPanel />
              </ProtectedRoute>
            } />
            <Route path="docker" element={
              <ProtectedRoute requireAdmin>
                <DockerPanel />
              </ProtectedRoute>
            } />
            <Route path="monitoring" element={<Monitoring />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
