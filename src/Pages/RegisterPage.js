import React, { useState } from "react";
import { createUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Card, Input, Select, Button, Image, Typography } from "antd";
import "./styles/RegisterPage.css";
const { Title } = Typography;

export default function RegisterPage2() {
  const navigate = useNavigate();

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
    details: `User registered successfully.`,
  });

  const [errors, setErrors] = useState({
    email: "",
    studentId: "",
    general: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

  const { fname, lname, email, studentId, password, confirmPassword } = registerData;
  if (!fname.trim() || !lname.trim() || !email.trim() || !studentId.trim() || !password.trim() || !confirmPassword.trim()) {
    alert("Email and password fields cannot be empty.");
    return; // 
  }

  // Password match check
  if (password !== confirmPassword) {
    setErrors({ general: "Passwords do not match." });
    return;
  }


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
        setErrors((prev) => ({
          ...prev,
          general: response.message || "Registration failed",
        }));
      }
    } catch (err) {
      if (err.response?.status === 400) {
        const msg = err.response.data.message || "";
        if (msg.includes("email")) {
          setErrors((prev) => ({ ...prev, email: msg }));
        } else if (msg.includes("student ID")) {
          setErrors((prev) => ({ ...prev, studentId: msg }));
        } else {
          setErrors((prev) => ({ ...prev, general: msg }));
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Something went wrong, try again.",
        }));
      }
    }
  }

  return (
    <div className="register-container">
      <Card className="register-card">
        {/* --- HEADER --- */}

        <div className="register-header">
          <Image
            src="/assets/kit.png"
            alt="Toolbox"
            width={88}
            preview={false}
            className="register-header__icon"
          />

          <Title
            id="register-header"
            level={3}
            className="register-header__title"
          >
            CREATE YOUR ACCOUNT
          </Title>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name block */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label>First Name</label>
              <Input
                name="fname"
                placeholder="First Name"
                value={registerData.fname}
                onChange={handleChange}
                size="large"
              />
            </div>
            <div>
              <label>Middle Name</label>
              <Input
                name="mname"
                placeholder="Middle Name"
                value={registerData.mname}
                onChange={handleChange}
                size="large"
              />
            </div>
            <div>
              <label>Last Name</label>
              <Input
                name="lname"
                placeholder="Last Name"
                value={registerData.lname}
                onChange={handleChange}
                size="large"
              />
            </div>
            <div>
              <label>Suffix</label>
              <Input
                name="suffix"
                placeholder="Jr., Sr., III"
                value={registerData.suffix}
                onChange={handleChange}
                size="large"
              />
            </div>
          </div>

          {/* Contacts / IDs */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div>
              <label>Email</label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
                value={registerData.email}
                onChange={handleChange}
                size="large"
              />
              {errors.email && (
                <div style={{ color: "red", marginTop: 4 }}>{errors.email}</div>
              )}
            </div>

            <div>
              <label>Phone</label>
              <Input
                name="phone"
                placeholder="Mobile Number"
                value={registerData.phone}
                onChange={handleChange}
                size="large"
              />
            </div>

            <div>
              <label>Student ID</label>
              <Input
                name="studentId"
                placeholder="Student ID"
                value={registerData.studentId}
                onChange={handleChange}
                size="large"
              />
              {errors.studentId && (
                <div style={{ color: "red", marginTop: 4 }}>
                  {errors.studentId}
                </div>
              )}
            </div>

            <div>
              <label>Birthday</label>
              {/* Keep native date via AntD Input to avoid handler changes */}
              <Input
                name="birthday"
                type="date"
                value={registerData.birthday}
                onChange={handleChange}
                size="large"
              />
            </div>
          </div>

          {/* Gender */}
          <div style={{ marginTop: 16 }}>
            <label>Gender</label>
            <Select
              size="large"
              placeholder="Select Gender"
              value={registerData.gender || undefined}
              onChange={(value) =>
                setRegisterData({ ...registerData, gender: value })
              }
              style={{ width: "100%" }}
              options={[
                { value: "", label: "Select Gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Rather not say", label: "Rather not say" },
              ]}
            />
          </div>

          {/* Passwords */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 16,
            }}
          >
            <div>
              <label>Password</label>
              <Input.Password
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleChange}
                size="large"
              />
            </div>
            <div>
              <label>Confirm Password</label>
              <Input.Password
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={handleChange}
                size="large"
              />
            </div>
          </div>

          {/* General error */}
          {errors.general && (
            <div style={{ color: "red", marginTop: 12 }}>{errors.general}</div>
          )}

          {/* Submit */}
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            style={{ width: "100%", marginTop: 20 }}
          >
            REGISTER
          </Button>
        </form>
      </Card>
    </div>
  );
}
