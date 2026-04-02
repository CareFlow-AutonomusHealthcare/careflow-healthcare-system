import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import DoctorLayout from './components/DoctorLayout';
import StaffLayout from './components/StaffLayout';
import AdminLayout from './components/AdminLayout';

import LoginPage from './pages/LoginPage';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorProposals from './pages/doctor/DoctorProposals';

import StaffDashboard from './pages/staff/StaffDashboard';
import PresentPatients from './pages/staff/PresentPatients';
import StaffPresence from './pages/staff/StaffPresence';
import ApprovedDecisions from './pages/staff/ApprovedDecisions';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProposals from './pages/admin/AdminProposals';
import UserManagement from './pages/admin/UserManagement';
import InventoryManager from './pages/admin/InventoryManager';
import AuditLogs from './pages/admin/AuditLogs';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg, #00478d 0%, #005eb8 100%)' }}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Loading CareFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  }

  if (user.role === 'doctor') {
    return (
      <DoctorLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/patients" element={<PatientHistory />} />
          <Route path="/doctor/proposals" element={<DoctorProposals />} />
          <Route path="*" element={<Navigate to="/doctor/dashboard" replace />} />
        </Routes>
      </DoctorLayout>
    );
  }

  if (user.role === 'staff') {
    return (
      <StaffLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/patients" element={<PresentPatients />} />
          <Route path="/staff/presence" element={<StaffPresence />} />
          <Route path="/staff/decisions" element={<ApprovedDecisions />} />
          <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
        </Routes>
      </StaffLayout>
    );
  }

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
