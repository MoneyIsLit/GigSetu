import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import FindService from './pages/customer/FindService';
import MyBookings from './pages/customer/MyBookings';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import MyJobs from './pages/worker/MyJobs';
import Earnings from './pages/worker/Earnings';
import WorkerProfile from './pages/worker/WorkerProfile';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          
          <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/find-service" element={<ProtectedRoute allowedRoles={['customer']}><FindService /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute allowedRoles={['customer']}><MyBookings /></ProtectedRoute>} />
          
          <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
          <Route path="/worker/jobs" element={<ProtectedRoute allowedRoles={['worker']}><MyJobs /></ProtectedRoute>} />
          <Route path="/worker/earnings" element={<ProtectedRoute allowedRoles={['worker']}><Earnings /></ProtectedRoute>} />
          <Route path="/worker/profile" element={<ProtectedRoute allowedRoles={['worker']}><WorkerProfile /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
