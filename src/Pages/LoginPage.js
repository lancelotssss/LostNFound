import {useState} from "react"
import '@ant-design/v5-patch-for-react-19';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { verifyUser } from "../api";



const LoginPage = () => {

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    })


   const navigate = useNavigate()

    function handleChange(e) 
    {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    }


    async function handleSubmit(e){
    e.preventDefault();
    
        //do not touch
    let response = await verifyUser(loginData);
        
    if (response && response.token) {

        sessionStorage.setItem("User", response.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;
        
        if (response.role === "student")
        {
            navigate("/cli/home");
        }
        else if (response.role === "admin")
        {
            navigate ("/main/found-items")
        }
        else 
        {
            alert("Unknown user")
        }


    } 
    else {
        alert("Login failed");
    }
        //safe
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
                <a href="/#/register">Register</a>
            </div>
            
            </form>
    </>
    )
}

export default LoginPage