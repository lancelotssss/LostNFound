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
    console.log("Register Form submitted:", loginData);
    let response = await verifyUser(loginData)
        if (response)
        {
            sessionStorage.setItem("User", response)
            axios.defaults.headers.common["Authorization"] = `Bearer ${response}`
            navigate("/cli/report")
        }
        else
        {
            alert("Login failed")
        }

    }


    return(
        <>
            <a href="/#/register">Register</a>
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