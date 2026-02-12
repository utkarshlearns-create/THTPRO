import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-loaded pages (code splitting - each loads only when route is visited)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const About = React.lazy(() => import('./pages/About'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ParentDashboard = React.lazy(() => import('./pages/ParentDashboard'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const ParentHome = React.lazy(() => import('./pages/ParentHome'));
const TutorHome = React.lazy(() => import('./pages/TutorHome'));
const TutorDashboard = React.lazy(() => import('./pages/TutorDashboard'));
const JobSearch = React.lazy(() => import('./pages/JobSearch'));
const WalletPage = React.lazy(() => import('./pages/WalletPage'));
const UserPackagesPage = React.lazy(() => import('./pages/UserPackagesPage'));
const MyPostedJobs = React.lazy(() => import('./pages/MyPostedJobs'));

// Superadmin (heavy bundle, loaded only for superadmins)
const SuperAdminLayout = React.lazy(() => import('./layouts/SuperAdminLayout'));
const SuperAdminDashboard = React.lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminLogin = React.lazy(() => import('./pages/superadmin/SuperAdminLogin'));
const HRMModule = React.lazy(() => import('./pages/superadmin/HRMModule'));
const MasterManagement = React.lazy(() => import('./pages/superadmin/MasterManagement'));
const CRMModule = React.lazy(() => import('./pages/superadmin/CRMModule'));
const PackageMaster = React.lazy(() => import('./pages/superadmin/PackageMaster'));
const AdminPerformance = React.lazy(() => import('./pages/superadmin/AdminPerformance'));

// KYC Pages
const TutorKYCPage = React.lazy(() => import('./pages/TutorKYCPage'));
const AdminKYCPage = React.lazy(() => import('./pages/AdminKYCPage'));
const KYCStatusDashboard = React.lazy(() => import('./components/tutor/kyc/KYCStatusDashboard'));

// Lazy-loaded placeholder
const SupportSystem = React.lazy(() => import('./pages/superadmin/Placeholders').then(m => ({ default: m.SupportSystem })));

// Loading spinner for lazy-loaded routes
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-slate-500">Loading...</span>
        </div>
    </div>
);

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
        <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes WITH Navbar */}
          <Route element={<StandardLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
              <Route path="/packages" element={
                <ProtectedRoute allowedRoles={['PARENT', 'TEACHER']}>
                   <UserPackagesPage />
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
                  <Route path="packages" element={<PackageMaster />} />
                  <Route path="packages/tutor" element={<PackageMaster role="TUTOR" />} />
                  <Route path="packages/parent" element={<PackageMaster role="PARENT" />} />
                  <Route path="performance" element={<AdminPerformance />} />
                  <Route path="performance/parent-admins" element={<AdminPerformance department="PARENT_OPS" />} />
                  <Route path="performance/tutor-admins" element={<AdminPerformance department="TUTOR_OPS" />} />
                  <Route path="support" element={<SupportSystem />} />
              </Route>
          </Route>
        </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
