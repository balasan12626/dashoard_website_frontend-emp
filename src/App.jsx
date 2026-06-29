import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/AppLayout.jsx';
import { AuthProvider } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import MpinPopup from './components/MpinPopup.jsx';

const Login = lazy(() => import('./components/Login.jsx'));
const Register = lazy(() => import('./components/Register.jsx'));
const ResetPassword = lazy(() => import('./components/ResetPassword.jsx'));
const ChangePassword = lazy(() => import('./components/ChangePassword.jsx'));
const Profile = lazy(() => import('./components/Profile.jsx'));
const TicketList = lazy(() => import('./components/TicketList.jsx'));
const CreateTicket = lazy(() => import('./components/CreateTicket.jsx'));
const TicketDetail = lazy(() => import('./components/TicketDetail.jsx'));
const MyForms = lazy(() => import('./components/MyForms.jsx'));
const FillAssignedForm = lazy(() => import('./components/FillAssignedForm.jsx'));
const TravelRequestList = lazy(() => import('./pages/TravelRequestList.jsx'));
const TravelRequestForm = lazy(() => import('./pages/TravelRequestForm.jsx'));
const CreateMpin = lazy(() => import('./components/CreateMpin.jsx'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingScreen />}>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-mpin" element={<CreateMpin />} />

          {/* Employee authenticated routes with sidebar */}
          <Route element={<AppLayout />}>
            <Route path="/tickets" element={<ProtectedRoute><TicketList /></ProtectedRoute>} />
            <Route path="/tickets/new" element={<ProtectedRoute><CreateTicket /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />
            <Route path="/my-forms" element={<ProtectedRoute><MyForms /></ProtectedRoute>} />
            <Route path="/my-forms/:assignmentId/fill" element={<ProtectedRoute><FillAssignedForm /></ProtectedRoute>} />
            <Route path="/travel-requests" element={<ProtectedRoute><TravelRequestList /></ProtectedRoute>} />
            <Route path="/travel-requests/new" element={<ProtectedRoute><TravelRequestForm /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          </Route>

          {/* Reset Password — public (token from email) */}
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/tickets" replace />} />
        </Routes>

        {/* Global MPIN popup mounted outside Routes */}
        <MpinPopup />
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
