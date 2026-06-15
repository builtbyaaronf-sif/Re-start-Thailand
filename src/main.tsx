import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import MuayThaiApp from './App'; // existing App.tsx — moved to /muay-thai
import StaysBrowse from './pages/stays/StaysBrowse';
import StayDetail from './pages/stays/StayDetail';
import StayEnquire from './pages/stays/StayEnquire';
import HostLogin from './pages/host/HostLogin';
import HostDashboard from './pages/host/HostDashboard';
import HostWizard from './pages/host/HostWizard';
import HostEditListing from './pages/host/HostEditListing';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminListing from './pages/admin/AdminListing';
import AdminSettings from './pages/admin/AdminSettings';
import ProtectedRoute from './components/ui/ProtectedRoute';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/muay-thai" element={<MuayThaiApp />} />
        <Route path="/stays" element={<StaysBrowse />} />
        <Route path="/stays/:id" element={<StayDetail />} />
        <Route path="/stays/:id/enquire" element={<StayEnquire />} />

        {/* Host portal */}
        <Route path="/host/login" element={<HostLogin />} />
        <Route path="/host/dashboard" element={
          <ProtectedRoute requiredRole="host"><HostDashboard /></ProtectedRoute>
        } />
        <Route path="/host/listings/new" element={<HostWizard />} />
        <Route path="/host/listings/:id/edit" element={
          <ProtectedRoute requiredRole="host"><HostEditListing /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin" redirectTo="/host/login"><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/listings/:id" element={
          <ProtectedRoute requiredRole="admin" redirectTo="/host/login"><AdminListing /></ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin" redirectTo="/host/login"><AdminSettings /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
