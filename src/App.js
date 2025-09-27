import './App.css';
import {HashRouter as Router, Routes, Route} from "react-router-dom"
import axios from 'axios';

import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
import { NavBar } from './components/NavBar';
import { Layout } from './components/Layout';
import { AdminDisplayData } from "./Pages/AdminDisplayData";
import { useEffect } from 'react';

function App() {

  useEffect(() => {
  let token = sessionStorage.getItem("User")
    if (token){
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    }
  }, []) //Kahit nag r-refresh nag s-store parin ung token

  return (
   <>
     <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>}/>
          <Route element={<Layout/>}>
            <Route path="/cli/report" element={<ReportItem/>}/>
            <Route path="/cli/claim" element={<ClaimForm/>}/>
            
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/main/lost-items" element={<AdminDisplayData/>}/>
          </Route>

          
        </Routes>
     </Router>
   </>
  );
}

export default App;
