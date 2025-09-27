import './App.css';
import {HashRouter as Router, Routes, Route} from "react-router-dom"

import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
import { NavBar } from './components/NavBar';
import { Layout } from './components/Layout';
import { AdminDisplayData } from "./Pages/AdminDisplayData";


function App() {
  return (
   <>
     <Router>
        <Routes>
          
          <Route element={<Layout/>}>
            <Route path="/cli/report" element={<ReportItem/>}/>
            <Route path="/cli/claim" element={<ClaimForm/>}/>
            <Route path="/" element={<LoginPage/>}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/main/lost-items" element={<AdminDisplayData/>}/>
          </Route>

          
        </Routes>
     </Router>
   </>
  );
}

export default App;
