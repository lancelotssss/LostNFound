import './App.css';
import {HashRouter as Router, Routes, Route} from "react-router-dom"
import axios from 'axios';

import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import {useEffect} from 'react'


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
          <Route path="/register" element={<RegisterPage/>}/>
          <Route path="/cli/report" element={<ReportItem/>}/>
        </Routes>
     </Router>
   </>
  );
}

export default App;
