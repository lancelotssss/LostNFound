import LoginPage from "./Pages/LoginPage";

import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import RegisterPage from "./Pages/RegisterPage";
import ReportItem from "./Pages/ReportItem";
import {Home} from "./Pages/Home";
import { Layout } from "./components/Layout";
import { useEffect } from "react";
import { AdminLost } from "./Pages/AdminLost";
import { AdminClaims } from "./Pages/AdminClaims";
import { AdminFound } from "./Pages/AdminFound";
import { UserSearch } from "./Pages/UserSearch";
import { UserSettings } from "./Pages/UserSettings";
import { AdminLayout } from "./components/AdminLayout";
import { ActivityLog } from "./Pages/ActivityLog";
import { UserSearchResults } from "./Pages/UserSearchResults";
import { AdminStorage } from "./Pages/AdminStorage"
import { AdminSettings } from "./Pages/AdminSettings"
import { AdminHistory } from "./Pages/AdminHistory"
import { AdminDashboard } from "./Pages/AdminDashboard";

function App() {
  useEffect(() => {
    let token = sessionStorage.getItem("User");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []); //Kahit nag r-refresh nag s-store parin ung token

  function ProtectedRoute({ children, allowedRoles }) {
    const token = sessionStorage.getItem("User");

    if (!token) {
      return <Navigate to="/" replace />;
    }

    let userRole;
    try {
      const decoded = JSON.parse(atob(token.split(".")[1])); // simple decode
      userRole = decoded.role;
    } catch (err) {
      console.error("Invalid token", err);
      return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      if (userRole === "student") {
        return <Navigate to="/cli/home" replace />;
      } else if (userRole === "admin") {
        return <Navigate to="/main/lost-items" replace />;
      } else {
        alert({ message: "Unknown User" });
      }
    }

    return children;
  }

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route
              path="/cli/home"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cli/report"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ReportItem />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cli/search/result"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <UserSearchResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cli/settings"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <UserSettings />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route element={<AdminLayout />}>
            <Route
              path="/main/lost-items"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLost />
                </ProtectedRoute>
              }
            />
             <Route path="/main/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
                </ProtectedRoute>} />
            <Route path="/main/found-items" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminFound />
              </ProtectedRoute>} />
            <Route path="/main/claim-items" element={<ProtectedRoute allowedRoles={["admin"]}>
              <AdminClaims /> 
              </ProtectedRoute> } />
            <Route path="/main/logs" element={<ProtectedRoute allowedRoles={["admin"]}>
              <ActivityLog />
              </ProtectedRoute>} />
            <Route path="/main/storage" element={<ProtectedRoute allowedRoles={["admin"]}>
              <AdminStorage />
            </ProtectedRoute>} />
              <Route path="/main/history" element = {<ProtectedRoute allowedRoles={["admin"]}>
              <AdminHistory />
              </ProtectedRoute>}/>
              <Route path="/main/settings" element = {<ProtectedRoute allowedRoles={["admin"]}>
                <AdminSettings/>
              </ProtectedRoute>} />

          </Route>




        </Routes>
      </Router>
    </>
  );
}

export default App;
