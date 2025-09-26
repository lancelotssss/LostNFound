import React, { useState } from "react";
import { createUser } from "../api";


export default function RegisterPage () {

  const [audit, setAudit] = useState({
    uid: "",
    action: "",
    targetUser: "",
    performedBy: "",
    timestamp: Date.now(),
    tickedId: "",
    details: "",
    })

  const [registerData, setRegisterData] = useState({
    name: "",
    studentId: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    gender: "",
  });


  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit (e) {
    e.preventDefault();
    console.log("Register Form submitted:", registerData);

    registerData.name = [registerData.fname, registerData.mname, registerData.lname]
        .filter(Boolean)
        .join(" ");

    let response = await createUser(registerData);

    

    if (response.status !== 200) {
        alert("User account could not be created");
    } else {
        alert("Registration successful!");
        setRegisterData({
        fname: "",
        mname: "",
        lname: "",
        studentId: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        birthday: "",
        gender: "",
      });
    }
  }

return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>

      <p>
        First Name:
        <input
          type="text"
          name="fname"
          placeholder="Full Name"
          value={registerData.fname}
          onChange={handleChange}
        />
      </p>

       <p>
        Middle Name:
        <input
          type="text"
          name="mname"
          placeholder="Middle Name"
          value={registerData.mname}
          onChange={handleChange}
        />
      </p>

       <p>
        Last Name:
        <input
          type="text"
          name="lname"
          placeholder="Last Name"
          value={registerData.lname}
          onChange={handleChange}
        />
      </p>


      <p>
        Student ID:
        <input
          type="text"
          name="studentId"
          placeholder="Student ID"
          value={registerData.studentId}
          onChange={handleChange}
        />
      </p>

      <p>
        Phone:
        <input
          type="text"
          name="phone"
          placeholder="Mobile Number"
          value={registerData.phone}
          onChange={handleChange}
        />
      </p>

      <p>
        Email:
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={registerData.email}
          onChange={handleChange}
        />
      </p>

      <p>
        Birthday:
        <input
          type="date"
          name="birthday"
          value={registerData.birthday}
          onChange={handleChange}
        />
      </p>

      <p>
        Gender:
        <select name="gender" value={registerData.gender} onChange={handleChange}>
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Rather not say">Rather not say</option>
        </select>
      </p>

      <p>
        Password:
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={registerData.password}
          onChange={handleChange}
        />
      </p>

      <p>
        Confirm Password:
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={registerData.confirmPassword}
          onChange={handleChange}
        />
      </p>

      <button type="submit">REGISTER</button>
    </form>
  );
}