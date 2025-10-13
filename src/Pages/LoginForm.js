import { Card, Input, Checkbox, Button, Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./styles/LoginForm.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { verifyUser } from "../api";
import axios from "axios";

// --- Cookie helpers ---
function setCookie(name, value, seconds) {
  const expires = seconds ? `; max-age=${seconds}` : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value || ""
  )}${expires}; path=/; samesite=lax`;
}
function getCookie(name) {
  const key = `${encodeURIComponent(name)}=`;
  return (
    document.cookie
      .split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith(key))
      ?.substring(key.length) || null
  );
}
function deleteCookie(name) {
  document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=/; samesite=lax`;
}

const ATTEMPTS_COOKIE = "loginAttempts";
const COOLDOWN_COOKIE = "loginCooldownUntil";
const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

function LoginForm() {
  // ---------- ERICK CODE ----------
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // cooldown state
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const timerRef = useRef(null);
  const inCooldown = useMemo(() => cooldownSecondsLeft > 0, [cooldownSecondsLeft]);

  // Only clear attempts when a cooldown cookie exists AND has expired
  function clearIfCooldownExpired() {
    const untilRaw = getCookie(COOLDOWN_COOKIE);
    if (!untilRaw) return false; // no cooldown cookie -> don't touch attempts
    const until = Number(untilRaw);
    if (Number.isFinite(until) && until <= Date.now()) {
      deleteCookie(COOLDOWN_COOKIE);
      deleteCookie(ATTEMPTS_COOKIE); // reset attempts ONLY here (cooldown finished)
      setCooldownSecondsLeft(0);
      setErrors((prev) => ({ ...prev, general: "" }));
      return true;
    }
    return false;
  }

  useEffect(() => {
    // If cooldown already expired (e.g., new tab), clean up now
    const cleared = clearIfCooldownExpired();

    // If still in an active cooldown, kick off the ticker
    if (!cleared) {
      const until = Number(getCookie(COOLDOWN_COOKIE) || 0);
      if (until && until > Date.now()) {
        startCooldown(until);
      }
    }

    return () => clearInterval(timerRef.current);
  }, []);

  function formatSeconds(s) {
    const v = Math.max(0, s);
    const mm = Math.floor(v / 60).toString().padStart(2, "0");
    const ss = (v % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function startCooldown(untilEpochMs) {
    setCookie(COOLDOWN_COOKIE, String(untilEpochMs), COOLDOWN_SECONDS + 5);
    tickCooldown(); // compute immediately
    clearInterval(timerRef.current);
    timerRef.current = setInterval(tickCooldown, 250);
  }

  function tickCooldown() {
    const until = Number(getCookie(COOLDOWN_COOKIE) || 0);
    if (!until) {
      setCooldownSecondsLeft(0);
      clearInterval(timerRef.current);
      return;
    }
    const diff = Math.ceil((until - Date.now()) / 1000);
    if (diff <= 0) {
      // Cooldown finished: now reset attempts
      deleteCookie(COOLDOWN_COOKIE);
      deleteCookie(ATTEMPTS_COOKIE);
      setCooldownSecondsLeft(0);
      setErrors((prev) => ({ ...prev, general: "" }));
      clearInterval(timerRef.current);
    } else {
      setCooldownSecondsLeft(diff);
    }
  }

  function bumpAttemptsOrStartCooldown() {
    const current = Number(getCookie(ATTEMPTS_COOKIE) || 0) + 1;
    setCookie(ATTEMPTS_COOKIE, String(current), 24 * 60 * 60); // keep for a day
    if (current >= MAX_ATTEMPTS) {
      const until = Date.now() + COOLDOWN_SECONDS * 1000;
      startCooldown(until);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // If a cooldown cookie exists but is expired, clear it now (and reset attempts)
    clearIfCooldownExpired();

    if (inCooldown) {
      // while cooling down, do nothing; Alert is shown instead of error text
      return;
    }

    const { email, password } = loginData;
    const newErrors = {};

    if (!email.trim()) newErrors.email = "Email is required.";
    if (!password.trim()) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let response = await verifyUser(loginData);

      if (
        response &&
        response.success === false &&
        response.message?.toLowerCase().includes("suspended")
      ) {
        setErrors({
          general: "Your account has been suspended. Please contact the administrator.",
        });
        return;
      }

      if (response && response.token) {
        // success => clear both cookies
        deleteCookie(ATTEMPTS_COOKIE);
        deleteCookie(COOLDOWN_COOKIE);

        sessionStorage.setItem("User", response.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;

        if (response.role === "student") {
          navigate("/cli/home");
        } else if (response.role === "admin") {
          navigate("/main/dashboard");
        } else {
          setErrors({ general: "Unknown user role." });
        }
      } else {
        // failed (no token)
        bumpAttemptsOrStartCooldown();
        setErrors({ general: "Incorrect email or password." });
        setLoginData({ ...loginData, password: "" });
      }
    } catch (err) {
      // failed due to backend/network
      bumpAttemptsOrStartCooldown();
      if (err.response?.status === 401) {
        setErrors({ general: "Invalid email or password." });
      } else {
        setErrors({ general: "Login failed. Please try again." });
      }
      setLoginData({ ...loginData, password: "" });
    }
  }
  // ---------- ERICK CODE ----------

  return (
    <>
      <Card className="container-card">
        <div className="login-container">
          <p className="login-title">SIGN IN YOUR ACCOUNT</p>

          {inCooldown && (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              message="Too many failed attempts"
              description={`Please wait ${formatSeconds(cooldownSecondsLeft)} before trying again.`}
            />
          )}

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
              disabled={inCooldown}
              style={{ fontFamily: "Poppins" }}
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
              disabled={inCooldown}
            />
            {errors.password && (
              <div style={{ color: "red", marginTop: 4 }}>{errors.password}</div>
            )}
          </form>

          <Button
            id="login-btn"
            size="large"
            className="login-btn success-pulse"
            type="primary"
            htmlType="submit"
            onClick={handleSubmit}
            disabled={inCooldown}
          >
            LOGIN
          </Button>

          {errors.general && !inCooldown && (
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

          <p className="login-to-register">
            Don't have an account? <Link to="/register">SIGN UP HERE</Link>
          </p>
        </div>
      </Card>
    </>
  );
}

export default LoginForm;
