import {useState} from "react"
import { verifyUser } from "../api";

const LoginPage = () => {

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
    console.log(response)
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