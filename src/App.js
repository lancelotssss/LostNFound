import './App.css';
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';

import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
import { Layout } from './components/Layout';
import { AdminLost } from './Pages/AdminLost';
import { AdminClaims } from './Pages/AdminClaims';
import { AdminFound } from './Pages/AdminFound';
import { AdminLayout } from './components/AdminLayout';

// ----------------------------
// Set Axios token if exists
// ----------------------------
const token = sessionStorage.getItem("User");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

// ----------------------------
// Protected Route Component
// ----------------------------
const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem("User");
  return token ? children : <Navigate to="/" replace />;
};

// ----------------------------
// App Component
// ----------------------------
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Client Routes */}
        <Route element={<Layout />}>
          <Route path="/cli/report" element={<ReportItem />} />
          <Route path="/cli/claim" element={<ClaimForm />} />
        </Route>

        {/* Admin Routes - Protected */}
        <Route element={<AdminLayout />}>
          <Route 
            path="/main/lost-items" 
            element={
              <PrivateRoute><AdminLost /></PrivateRoute>
            } 
          />
          <Route 
            path="/main/found-items" 
            element={
              <PrivateRoute><AdminFound /></PrivateRoute>
            } 
          />
          <Route 
            path="/main/claim-items" 
            element={
              <PrivateRoute><AdminClaims /></PrivateRoute>
            } 
          />
        </Route>

        {/* Fallback Route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
