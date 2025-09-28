import LoginPage from './Pages/LoginPage'; 
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios'
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
import Home from './Pages/Home';
import { NavBar } from './components/NavBar';
import { Layout } from './components/Layout';
import { AdminDisplayData } from "./Pages/AdminDisplayData";
import { useEffect } from 'react';
import { AdminLost } from './Pages/AdminLost';
import { AdminClaims } from './Pages/AdminClaims';
import { AdminFound } from './Pages/AdminFound';
import {AdminLayout} from './components/AdminLayout';
import { NavBarAdmin } from './components/NavBarAdmin';

function App() {

  useEffect(() => {
  let token = sessionStorage.getItem("User")
    if (token){
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, []) //Kahit nag r-refresh nag s-store parin ung token

  function ProtectedRoute({ children }) {
  const user = sessionStorage.getItem("User"); 

    if (!user) {
      return <Navigate to="/" replace />;
    }

  return children;
  }

  

  return (
   <>
     <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route element={<Layout/>}>
            <Route path="/cli/home" element = {<ProtectedRoute><Home/></ProtectedRoute>}/>
            <Route path="/cli/report" element={<ProtectedRoute><ReportItem/></ProtectedRoute>}/>
            <Route path="/cli/claim" element={<ProtectedRoute><ClaimForm/></ProtectedRoute>}/>
          </Route>

          <Route element={<AdminLayout/>}>
              <Route path="/main/lost-items" element={<AdminLost/>}/>
              <Route path="/main/found-items" element={<AdminFound/>}/>
              <Route path="/main/claim-items" element={<AdminClaims/>}/>
          </Route>

          
        </Routes>
     </Router>
   </>
  );
}

export default App;