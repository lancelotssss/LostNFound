import React, { useState } from "react";
import { createUser } from "../api";
import { useNavigate } from "react-router-dom";


export default function RegisterPage() {
  
  const navigate = useNavigate()

  const [registerData, setRegisterData] = useState({
    fname: "",
    mname: "",
    lname: "",
    suffix: "",
    name: "",
    suffix: "",
    studentId: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthday: "",
    gender: "",
    role: "student",
    status: "active",
    lastLogin: new Date(),
    availableClaim: 3,
    availableFound: 5,
    availableMissing: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    aid: Date.now().toString(),
    uid: Date.now().toString(),
    action: "REGISTER",
    targetUser: "",
    performedBy: "System",
    timestamp: new Date(),
    ticketId: "",
    details: `User registered successfully.`
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

  

    const newRegisterData = {
  ...registerData,
  name: [registerData.fname, registerData.mname, registerData.lname, registerData.suffix]
    .filter(Boolean)
    .join(" ")};
    console.log(newRegisterData)

    // Send data to backend
    const response = await createUser(newRegisterData);
 

    if (response?.student && response?.audit) {
      alert("Account added!");
        setRegisterData({
          fname: "",
          mname: "",
          lname: "",
          name: "",
          suffix: "",
          studentId: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          birthday: "",
          gender: "",
          role: "",
          status: "",
          lastLogin: "",
          availableClaim: "",
          availableFound: "",
          availableMissing: "",
          createdAt: "",
          updatedAt: "",
          uid: "",
        });
        navigate("/")

      } else {
        alert("Registration unsuccessful!");
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
          placeholder="First Name"
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
        Suffix:
        <input
          type="text"
          name="suffix"
          placeholder="Name Suffix"
          value={registerData.suffix}
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
