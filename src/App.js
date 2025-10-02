import LoginPage from './Pages/LoginPage'; 
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'
import RegisterPage2 from './Pages/RegisterPage2';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
import Home from './Pages/Home';
import { NavBar } from './components/NavBar';
import { Layout } from './components/Layout';
import { AdminDisplayData } from "./Pages/AdminDisplayData";
import { useEffect } from 'react';
import { AdminLost } from './Pages/AdminLost';
import { AdminClaims } from './Pages/AdminClaims';
import  {AdminFound}  from './Pages/AdminFound';
import { UserSearch } from './Pages/UserSearch';
import { UserSettings } from './Pages/UserSettings';
import {AdminLayout} from './components/AdminLayout';
import { NavBarAdmin } from './components/NavBarAdmin';
import { ActivityLog } from './Pages/ActivityLog';
import { UserSearchResults } from './Pages/UserSearchResults';

function App() {

  useEffect(() => {
  let token = sessionStorage.getItem("User")
    if (token){
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, []) //Kahit nag r-refresh nag s-store parin ung token

  function ProtectedRoute({ children, allowedRoles }) {
  const token = sessionStorage.getItem("User");
  
  if (!token){
    return <Navigate to="/" replace />
  }
  
  
  let userRole;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1])); // simple decode
    userRole = decoded.role;
  } catch (err) {
    console.error("Invalid token", err);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    
    if (userRole === 'student'){
       return <Navigate to="/cli/home" replace />;
    }
    else if (userRole === 'admin'){
       return <Navigate to="/main/lost-items" replace />;
    }
    else {
        alert({message: "Unknown User"})
    }
   
  }

  
  return children;
  }

  

  return (
   <>
     <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage2/>}/>
          <Route element={<Layout/>}>
            <Route path="/cli/home" element = {<ProtectedRoute allowedRoles={['student']}><Home/></ProtectedRoute>}/>
            <Route path="/cli/report" element={<ProtectedRoute allowedRoles={['student']}><ReportItem/></ProtectedRoute>}/>
            <Route path="/cli/search" element={<ProtectedRoute allowedRoles={['student']}><UserSearch/></ProtectedRoute>}/>
            <Route path="/cli/search/result" element = {<ProtectedRoute allowedRoles={['student']}><UserSearchResults/></ProtectedRoute>}/>
            <Route path="/cli/settings" element={<ProtectedRoute allowedRoles={['student']}><UserSettings/></ProtectedRoute>}/>
            
          </Route>

          <Route element={<AdminLayout/>}>
              <Route path="/main/lost-items" element={<ProtectedRoute allowedRoles={['admin']}><AdminLost/></ProtectedRoute>}/>
              <Route path="/main/found-items" element={<AdminFound/>}/>
              <Route path="/main/claim-items" element={<AdminClaims/>}/>
              <Route path="/main/claim-items" element={<AdminClaims/>}/>
              <Route path="/main/logs" element={<ActivityLog/>}/>
          </Route>

          
        </Routes>
     </Router>
   </>
  );
}

export default App;