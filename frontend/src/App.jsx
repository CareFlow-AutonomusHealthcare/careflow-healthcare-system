import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import DoctorLayout from './components/DoctorLayout';
import StaffLayout from './components/StaffLayout';
import AdminLayout from './components/AdminLayout';

// Auth
import LoginPage from './pages/LoginPage';

// Doctor pages
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorProposals from './pages/doctor/DoctorProposals';

// Staff pages
import PresentPatients from './pages/staff/PresentPatients';
import StaffPresence from './pages/staff/StaffPresence';
import ApprovedDecisions from './pages/staff/ApprovedDecisions';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import InventoryManager from './pages/admin/InventoryManager';
import AuditLogs from './pages/admin/AuditLogs';
import AdminProposals from './pages/admin/AdminProposals';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-clinical-900 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading CareFlow...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  // Doctor routes
  if (user.role === 'doctor') {
    return (
      <DoctorLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/patients" replace />} />
          <Route path="/doctor/patients" element={<PatientHistory />} />
          <Route path="/doctor/proposals" element={<DoctorProposals />} />
          <Route path="*" element={<Navigate to="/doctor/patients" replace />} />
        </Routes>
      </DoctorLayout>
    );
  }

  // Staff routes
  if (user.role === 'staff') {
    return (
      <StaffLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/staff/patients" replace />} />
          <Route path="/staff/patients" element={<PresentPatients />} />
          <Route path="/staff/presence" element={<StaffPresence />} />
          <Route path="/staff/decisions" element={<ApprovedDecisions />} />
          <Route path="*" element={<Navigate to="/staff/patients" replace />} />
        </Routes>
      </StaffLayout>
    );
  }

  // Admin routes
  if (user.role === 'admin') {
    return (
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/proposals" element={<AdminProposals />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/inventory" element={<InventoryManager />} />
          <Route path="/admin/logs" element={<AuditLogs />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AdminLayout>
    );
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
