import React, { useState } from "react";
import { createUser } from "../api";


export default function RegisterPage () {

  const [registerData, setRegisterData] = useState({
    studentid: "",
    fname: "",
    mname: "",
    lname: "",
    birthday:"",
    gender:"",
    email: "",
    mobileNumber:"",
    password: ""
  })

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit (e) {
    e.preventDefault();
    console.log("Register Form submitted:", registerData);
    let response = await createUser(registerData)
    if (response.status !== 200){
        alert("User account could not be created")
    }
  }

return(
    <form onSubmit={handleSubmit}>
        <h1>Register</h1>
        
            <div>
                <p>Student ID:<input type="text" name="studentid" placeholder="Student ID" value={registerData.studentid} onChange={handleChange}/></p>
            </div>

            <div>
                <p>First Name:<input type="text" name="fname" placeholder="First Name" value={registerData.fname} onChange={handleChange}/></p>
            </div>
                
            <div>
                <p>Middle Name:<input type="text" name="mname" placeholder="Middle Name" value={registerData.mname} onChange={handleChange}/></p>
            </div>

            <div>
                <p>Last Name:<input type="text" name="lname" placeholder="Last Name" value={registerData.lname} onChange={handleChange}/></p>
            </div>

            <div>
                <p>Birthday: <input type="date" name="birthday" value={registerData.birthday} onChange={handleChange}/></p>
            </div>

            <p>Gender: <select name="gender" value={registerData.gender} onChange={handleChange}>
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Rather not say</option>
            </select></p>

            <div>
                <p>Email:<input type="text" name="email" placeholder="Email" value={registerData.email} onChange={handleChange}/></p>
            </div>

            <div>
                <p>Password:<input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleChange}/></p>
            </div>

             <div>
                <p>Confirm Password: <input type="password" name="password" placeholder="Confirm Password" value={registerData.password} onChange={handleChange}/></p>
            </div>

            <div>
                <button type="submit" >REGISTER</button>
            </div>
        </form>
    )
}


