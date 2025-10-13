import './styles/LoginBrand.css'
import { useNavigate } from "react-router-dom";


function  BrandPanel() {
  const navigate = useNavigate();
  return (
    <div className="container-brandpanel">
      <div className="brand-img">
        <div className="lower-img">
          <img
            id="foundhub"
            src="/assets/foundhub2.png"
            alt="Logo"
            className="floating"
            onClick={() => navigate("/")}  
          />
        </div>
      </div>
    </div>
  );
}



export default BrandPanel;