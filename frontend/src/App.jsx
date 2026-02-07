import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import ParentDashboard from './pages/ParentDashboard';

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ParentHome from './pages/ParentHome';
import TutorHome from './pages/TutorHome';
import TutorDashboard from './pages/TutorDashboard';
import JobSearch from './pages/JobSearch';
import WalletPage from './pages/WalletPage';
import MyPostedJobs from './pages/MyPostedJobs';
import ProtectedRoute from './components/ProtectedRoute';

import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import HRMModule from './pages/superadmin/HRMModule';
import { MasterManagement, CRMModule, SupportSystem } from './pages/superadmin/Placeholders';

// KYC Pages
import TutorKYCPage from './pages/TutorKYCPage';
import AdminKYCPage from './pages/AdminKYCPage';
import KYCStatusDashboard from './components/tutor/kyc/KYCStatusDashboard';

// Layout for standard pages that require the generic Navbar
const StandardLayout = () => {
    return (
        <>
            <Navbar />
            <Outlet />
        </>
    );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Routes>
          {/* Routes WITH Navbar */}
          <Route element={<StandardLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/about" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/find-jobs" element={<JobSearch />} />

              {/* Protected Standard Routes */}
              <Route path="/parent-home" element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                  <ParentHome />
                </ProtectedRoute>
              } />
              <Route path="/wallet" element={
                <ProtectedRoute allowedRoles={['PARENT', 'TEACHER']}>
                   <WalletPage />
                </ProtectedRoute>
              } />
              <Route path="/my-jobs" element={
                <ProtectedRoute allowedRoles={['PARENT']}>
                   <MyPostedJobs />
                </ProtectedRoute>
              } />
              <Route path="/tutor-home" element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TutorHome />
                </ProtectedRoute>
              } />

              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/dashboard/admin/parent" element={<AdminDashboard mode="parent" />} />
                <Route path="/dashboard/admin/tutor" element={<AdminDashboard mode="tutor" />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} /> {/* Default/Combined View */}
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
                <Route path="/dashboard/tutor" element={<TutorDashboard />} />
                <Route path="/tutor/kyc" element={<TutorKYCPage />} />
                <Route path="/tutor/kyc/status" element={<KYCStatusDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
                <Route path="/dashboard/parent" element={<ParentDashboard />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/kyc-verifications" element={<AdminKYCPage />} />
              </Route>
          </Route>

          {/* Superadmin Routes (NO Navbar) */}
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />

          <Route element={<ProtectedRoute allowedRoles={['SUPERADMIN']} loginPath="/superadmin/login" />}>
              <Route path="/superadmin" element={<SuperAdminLayout />}>
                  <Route index element={<SuperAdminDashboard />} />
                  <Route path="masters" element={<MasterManagement />} />
                  <Route path="hrm" element={<HRMModule />} />
                  <Route path="crm" element={<CRMModule />} />
                  <Route path="support" element={<SupportSystem />} />
              </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
