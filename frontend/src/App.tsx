import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CallProvider } from './context/CallContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CallingModal } from './components/CallingModal';
import { InboundCallNotification } from './components/InboundCallNotification';

import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';

// Employee Pages
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { MyLeads } from './pages/employee/MyLeads';
import { LeadDetail } from './pages/employee/LeadDetail';
import { CallingWorkspace } from './pages/employee/CallingWorkspace';
import { CallHistory } from './pages/employee/CallHistory';
import { FollowUps } from './pages/employee/FollowUps';
import { MySessions } from './pages/employee/MySessions';
import { MyProfile } from './pages/employee/MyProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeManagement } from './pages/admin/EmployeeManagement';
import { EmployeeDetail } from './pages/admin/EmployeeDetail';
import { LeadManagement } from './pages/admin/LeadManagement';
import { CallMonitoring } from './pages/admin/CallMonitoring';
import { RecordingManagement } from './pages/admin/RecordingManagement';
import { AttendanceActivity } from './pages/admin/AttendanceActivity';
import { AnalyticsReports } from './pages/admin/AnalyticsReports';
import { ExcelExports } from './pages/admin/ExcelExports';
import { TelephonyConfig } from './pages/admin/TelephonyConfig';
import { AuditLogs } from './pages/admin/AuditLogs';

const ProtectedLayout: React.FC<{ adminOnly?: boolean; children: React.ReactNode }> = ({
  adminOnly = false,
  children
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mr-2" />
        Authenticating terminal session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = ['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role);

  if (adminOnly && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${
      isAdmin ? 'bg-[#f0fdf9]' : 'bg-[#fff5f7]'
    }`}>
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <CallingModal />
      <InboundCallNotification />
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user && ['super_admin', 'operations_admin', 'reporting_admin'].includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }
  return <EmployeeDashboard />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CallProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Default Route: Auto-routes Admins to /admin, Employees to EmployeeDashboard */}
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <RootRedirect />
                </ProtectedLayout>
              }
            />
            <Route
              path="/my-leads"
              element={
                <ProtectedLayout>
                  <MyLeads />
                </ProtectedLayout>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedLayout>
                  <LeadDetail />
                </ProtectedLayout>
              }
            />
            <Route
              path="/calling"
              element={
                <ProtectedLayout>
                  <CallingWorkspace />
                </ProtectedLayout>
              }
            />
            <Route
              path="/call-history"
              element={
                <ProtectedLayout>
                  <CallHistory />
                </ProtectedLayout>
              }
            />
            <Route
              path="/follow-ups"
              element={
                <ProtectedLayout>
                  <FollowUps />
                </ProtectedLayout>
              }
            />
            <Route
              path="/work-sessions"
              element={
                <ProtectedLayout>
                  <MySessions />
                </ProtectedLayout>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <MyProfile />
                </ProtectedLayout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedLayout adminOnly>
                  <AdminDashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/employees"
              element={
                <ProtectedLayout adminOnly>
                  <EmployeeManagement />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/employees/:id"
              element={
                <ProtectedLayout adminOnly>
                  <EmployeeDetail />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/leads"
              element={
                <ProtectedLayout adminOnly>
                  <LeadManagement />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/calls"
              element={
                <ProtectedLayout adminOnly>
                  <CallMonitoring />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/recordings"
              element={
                <ProtectedLayout adminOnly>
                  <RecordingManagement />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/attendance"
              element={
                <ProtectedLayout adminOnly>
                  <AttendanceActivity />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedLayout adminOnly>
                  <AnalyticsReports />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/exports"
              element={
                <ProtectedLayout adminOnly>
                  <ExcelExports />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/telephony"
              element={
                <ProtectedLayout adminOnly>
                  <TelephonyConfig />
                </ProtectedLayout>
              }
            />
            <Route
              path="/admin/audit"
              element={
                <ProtectedLayout adminOnly>
                  <AuditLogs />
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CallProvider>
    </AuthProvider>
  </ThemeProvider>
);
};

export default App;
