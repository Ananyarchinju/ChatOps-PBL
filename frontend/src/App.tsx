import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatBot from './pages/ChatBot';
import JenkinsPanel from './pages/JenkinsPanel';
import DockerPanel from './pages/DockerPanel';
import MonitoringPanel from './pages/MonitoringPanel';
import Logs from './pages/Logs';
import Settings from './pages/Settings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children, requireAdmin }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

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
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
              <Route path="monitoring" element={<MonitoringPanel />} />
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
    </ThemeProvider>
  );
}

export default App;
