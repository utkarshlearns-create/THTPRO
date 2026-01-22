import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* New routes for ParentHome and TutorHome */}
          {/* New routes for ParentHome and TutorHome */}
          <Route path="/parent-home" element={
            <ProtectedRoute allowedRoles={['PARENT']}>
              <ParentHome />
            </ProtectedRoute>
          } />
          <Route path="/tutor-home" element={
            <ProtectedRoute allowedRoles={['TEACHER']}>
              <TutorHome />
            </ProtectedRoute>
          } />

          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
          </Route>
          
          <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
            <Route path="/dashboard/tutor" element={<TutorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
            <Route path="/dashboard/parent" element={<ParentDashboard />} />
          </Route>
          {/* Add more routes here as we build them */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
