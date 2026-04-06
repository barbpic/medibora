import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import PatientsDirectory from '@/pages/PatientsDirectory';
import PatientChart from '@/pages/PatientChart';
import PatientDetailPage from '@/pages/PatientDetailPage';
import VitalSignsPage from '@/pages/VitalSignsPage';
import EncountersPage from '@/pages/EncountersPage';
import EncounterDetailPage from '@/pages/EncounterDetailPage';
import NewEncounterPage from '@/pages/NewEncounterPage';
import AlertsPage from '@/pages/AlertsPage';
import SearchPage from '@/pages/SearchPage';
import InteroperabilityPage from '@/pages/InteroperabilityPage';
import UsersPage from '@/pages/UsersPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/patients" element={<ProtectedRoute><PatientsDirectory /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute><PatientDetailPage /></ProtectedRoute>} />
              <Route path="/patients/:id/chart" element={<ProtectedRoute><PatientChart /></ProtectedRoute>} />
              <Route path="/patients/:id/vitals" element={<ProtectedRoute><VitalSignsPage /></ProtectedRoute>} />
              <Route path="/patients/:id/new-encounter" element={<ProtectedRoute><NewEncounterPage /></ProtectedRoute>} />
              <Route path="/interoperability" element={<ProtectedRoute><InteroperabilityPage /></ProtectedRoute>} />
              <Route path="/encounters" element={<ProtectedRoute><EncountersPage /></ProtectedRoute>} />
              <Route path="/encounters/:id" element={<ProtectedRoute><EncounterDetailPage /></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute requireAdmin><UsersPage /></ProtectedRoute>} />
              <Route path="/audit-logs" element={<ProtectedRoute requireAdmin><AuditLogsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
