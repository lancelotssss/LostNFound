import './App.css';
import {HashRouter as Router, Routes, Route} from "react-router-dom"

import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';

function App() {
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
