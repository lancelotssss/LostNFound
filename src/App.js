import LoginPage from './Pages/LoginPage'; 
import RegisterPage from './Pages/RegisterPage';
import ReportItem from './Pages/ReportItem';
import ClaimForm from './Pages/ClaimForm';
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
    axios.defaults.headers.common["Authorization"] = Bearer ${token}
    }
  }, []) //Kahit nag r-refresh nag s-store parin ung token
  

  return (
   <>
     <Router>
        <Routes>
          <Route path="/" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage/>}/>
          <Route element={<Layout/>}>
            <Route path="/cli/report" element={<ReportItem/>}/>
            <Route path="/cli/claim" element={<ClaimForm/>}/>
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