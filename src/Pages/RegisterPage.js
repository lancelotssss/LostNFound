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
    sid: Date.now().toString(),
    action: "REGISTER",
    targetUser: "",
    performedBy: "System",
    timestamp: new Date(),
    ticketId: "",
    details: `User registered successfully.`
  });

  const [errors, setErrors] = useState({
  email: "",
  studentId: "",
  general: ""
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
      .join(" ")
  };

  setErrors({ email: "", studentId: "", general: "" }); // reset errors

  try {
    const response = await createUser(newRegisterData);

    if (response?.success) {
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
       navigate("/");
    } else {
      setErrors(prev => ({ ...prev, general: response.message || "Registration failed" }));
    }
  } catch (err) {
    if (err.response?.status === 400) {
      const msg = err.response.data.message || "";
      if (msg.includes("email")) {
        setErrors(prev => ({ ...prev, email: msg }));
      } else if (msg.includes("student ID")) {
        setErrors(prev => ({ ...prev, studentId: msg }));
      } else {
        setErrors(prev => ({ ...prev, general: msg }));
      }
    } else {
      setErrors(prev => ({ ...prev, general: "Something went wrong, try again." }));
    }
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
      Email:
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={registerData.email}
        onChange={handleChange}
      />
      {errors.email && <span style={{ color: "red" }}>{errors.email}</span>}
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
      Student ID:
      <input
        type="text"
        name="studentId"
        placeholder="Student ID"
        value={registerData.studentId}
        onChange={handleChange}
      />
      {errors.studentId && <span style={{ color: "red" }}>{errors.studentId}</span>}
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
      {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
      <button type="submit">REGISTER</button>
    </form>
  );
}
