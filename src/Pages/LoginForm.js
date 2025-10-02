import { Card, Input, Checkbox, Button } from "antd";
import { Link } from "react-router-dom";
import "./styles/LoginForm.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyUser } from "../api";
import axios from "axios";

function LoginForm() {
  // ---------- ERICK CODE ----------
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    //do not touch
    let response = await verifyUser(loginData);

    if (response && response.token) {
      sessionStorage.setItem("User", response.token);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.token}`;

      if (response.role === "student") {
        navigate("/cli/home");
      } else if (response.role === "admin") {
        navigate("/main/found-items");
      } else {
        alert("Unknown user");
      }
    } else {
      alert("Login failed");
    }
    //safe
  }
  // ---------- ERICK CODE ----------

  return (
    <>
      <Card className="container-card">
        <div className="login-container">
          {/* TITLE <----- */}
          <p className="login-title">SIGN IN YOUR ACCOUNT</p>

          {/* LOGIN INPUTS <----- */}
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
          </form>

          <div className="login-chk-forgot">
            <Checkbox id="login-remember">
              <p id="chkbox-p">REMEMBER ME</p>
            </Checkbox>
            <p>
              <a href="#">FORGOT PASSWORD?</a>
            </p>
          </div>

          <Button
            id="login-btn"
            size="large"
            className="login-btn"
            type="primary"
            htmlType="submit" // <-- this is the key
            onClick={handleSubmit} // <-- this is the key
          >
            LOGIN
          </Button>

          <p className="login-to-register">
            Don't have an account? <Link to="/register">SIGN UP HERE</Link>
          </p>
        </div>
      </Card>
    </>
  );
}

export default LoginForm;
