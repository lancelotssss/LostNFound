import {useState} from "react"
import { verifyUser } from "../api";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const LoginPage = () => {

   const navigate = useNavigate()

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })

    function handleChange(e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    }

    async function handleSubmit(e){
    e.preventDefault();
    console.log("Login Form submitted:", loginData);

    let response = await verifyUser(loginData);

    if (response && response.token) {
        
        sessionStorage.setItem("User", response.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
        navigate("/cli/report");
    } else {
        alert("Login failed");
    }
    }

    return(
        <>

            <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div>
                <p>Email:<input type="text" name="email" placeholder="Email" value={loginData.email} onChange={handleChange}/></p>
            </div>
            
            <div>
                <p>Password:<input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleChange}/></p>
            </div>

            <div>
                <button type="submit" >LOGIN</button>
            </div>
            
            </form>
    </>
    )
}

export default LoginPage