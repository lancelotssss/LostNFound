import { Card, Input, Checkbox, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./styles/LoginForm.css";
import { useState } from "react";
import { verifyUser } from "../api";
import axios from "axios";

function LoginForm() {
  // ---------- ERICK CODE ----------
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({}); // NEW: for inline validation errors
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear specific error as user types
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const { email, password } = loginData;
    const newErrors = {};

    // 🔍 Frontend validation
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password.trim()) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // do not touch backend logic
      let response = await verifyUser(loginData);


       if (response && response.success === false && response.message?.toLowerCase().includes("suspended")) {
          setErrors({ general: "Your account has been suspended. Please contact the administrator." });
          return;
        }
        
      if (response && response.token) {
        sessionStorage.setItem("User", response.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;

        if (response.role === "student") {
          navigate("/cli/home");
        } else if (response.role === "admin") {
          navigate("/main/found-items");
        }
        else {
          setErrors({ general: "Unknown user role." });
        }
      } else {
        // Login failed (no token returned)
        setErrors({ general: "Incorrect email or password." });
        setLoginData({ ...loginData, password: "" }); // clear password
      }
    } catch (err) {
      // Handle backend or network errors
      if (err.response?.status === 401) {
        setErrors({ general: "Invalid email or password." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
      setLoginData({ ...loginData, password: "" }); // clear password
    }
  }
  // ---------- ERICK CODE ----------

  return (
    <>
      <Card className="container-card">
        <div className="login-container">
          {/* TITLE */}
          <p className="login-title">SIGN IN YOUR ACCOUNT</p>

          {/* LOGIN INPUTS */}
          <form className="login-form" onSubmit={handleSubmit}>
            <p className="label-email">E-MAIL</p>
            <Input
              className="login-inputs"
              size="large"
              placeholder="juandelacruz@gmail.com"
              type="text"
              name="email"
              value={loginData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <div style={{ color: "red", marginTop: 4 }}>{errors.email}</div>
            )}

            <p className="label-password">PASSWORD</p>
            <Input.Password
              className="login-inputs"
              size="large"
              placeholder="********"
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div style={{ color: "red", marginTop: 4 }}>{errors.password}</div>
            )}
          </form>
            
          {/* REMEMBER ME + FORGOT PASSWORD */}
          <div className="login-chk-forgot">
            <Checkbox id="login-remember">
              <p id="chkbox-p">REMEMBER ME</p>
            </Checkbox>
            <p>
              <a href="#">FORGOT PASSWORD?</a>
            </p>
          </div>

          {/* SUBMIT BUTTON */}
          <Button
            id="login-btn"
            size="large"
            className="login-btn"
            type="primary"
            htmlType="submit"
            onClick={handleSubmit}
          >
            LOGIN
          </Button>

          {/* GENERAL ERROR MESSAGE */}
          {errors.general && (
            <div
              style={{
                color: "red",
                textAlign: "center",
                marginTop: 12,
                fontWeight: 500,
              }}
            >
              {errors.general}
            </div>
          )}

          {/* SIGN UP LINK */}
          <p className="login-to-register">
            Don't have an account? <Link to="/register">SIGN UP HERE</Link>
          </p>
        </div>
      </Card>
    </>
  );
}

export default LoginForm;
