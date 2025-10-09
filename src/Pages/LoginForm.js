import { Card, Input, Checkbox, Button, Alert } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./styles/LoginForm.css";
import { useEffect, useState, useRef } from "react";
import { verifyUser } from "../api";
import axios from "axios";

// ====== Config ======
const MAX_ATTEMPTS = 3;
const LOCK_MS = 30_000; // demo: 30s
const LS_ATTEMPTS = "foundhub_login_attempts";
const LS_LOCK_UNTIL = "foundhub_login_locked_until";
const LS_REMEMBER_EMAIL = "foundhub_last_email";

const isValidEmail = (s) => /^\S+@\S+\.\S+$/.test(s.trim());

function LoginForm() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    bannerTitle: "",
    bannerDesc: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // NEW: soft success pulse (500ms) before redirect
  const [successPulse, setSuccessPulse] = useState(false);

  const [lockedUntil, setLockedUntil] = useState(
    Number(localStorage.getItem(LS_LOCK_UNTIL) || 0)
  );
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef(null);

  // ===== helpers =====
  const now = () => Date.now();
  const getAttempts = () => Number(localStorage.getItem(LS_ATTEMPTS) || 0);
  const setAttempts = (n) => localStorage.setItem(LS_ATTEMPTS, String(n));
  const resetAttempts = () => localStorage.removeItem(LS_ATTEMPTS);

  const clearBanner = () =>
    setErrors((prev) => ({ ...prev, bannerTitle: "", bannerDesc: "" }));
  const showBanner = (title, desc = "") =>
    setErrors((prev) => ({ ...prev, bannerTitle: title, bannerDesc: desc }));

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startCountdown = (untilTs) => {
    const tick = () => {
      const ms = untilTs - now();
      const s = Math.max(0, Math.ceil(ms / 1000));
      setSecondsLeft(s);
      if (s <= 0) {
        stopCountdown();
        setLockedUntil(0);
        localStorage.removeItem(LS_LOCK_UNTIL);
        resetAttempts();                  // ensure attempts reset on unlock
        clearBanner();
      }
    };
    stopCountdown();
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  // preload remembered email
  useEffect(() => {
    const last = localStorage.getItem(LS_REMEMBER_EMAIL);
    if (last) setLoginData((p) => ({ ...p, email: last, remember: true }));
  }, []);

  // lock on mount if needed
  useEffect(() => {
    if (lockedUntil && lockedUntil > now()) {
      startCountdown(lockedUntil);
      showBanner(
        "Incorrect email or password and login limit exceeded!",
      );
    } else {
      stopCountdown();
      setLockedUntil(0);
      localStorage.removeItem(LS_LOCK_UNTIL);
      resetAttempts();
    }
    return stopCountdown;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e) {
    const { name, value, checked, type } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.bannerTitle || errors.bannerDesc) clearBanner();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || successPulse) return; // guard while pulsing or submitting

    // If currently locked, show countdown & stop
    const locked = lockedUntil && lockedUntil > now();
    if (locked) {
      const ms = lockedUntil - now();
      const s = Math.max(1, Math.ceil(ms / 1000));
      showBanner(
        "Incorrect email or password and login limit exceeded!",
        `Please try again in ${s} second${s > 1 ? "s" : ""}.`
      );
      return;
    }

    // Frontend validation (email format + required)
    const { email, password } = loginData;
    const newFieldErrors = { email: "", password: "" };

    if (!email.trim()) newFieldErrors.email = "Email is required.";
    else if (!isValidEmail(email)) newFieldErrors.email = "Enter a valid email address.";

    if (!password.trim()) newFieldErrors.password = "Password is required.";

    if (newFieldErrors.email || newFieldErrors.password) {
      setErrors((prev) => ({ ...prev, ...newFieldErrors, bannerTitle: "", bannerDesc: "" }));
      return;
    }

    setSubmitting(true);
    clearBanner();

    try {
      const response = await verifyUser({ email, password });

      if (response && response.token) {
        // success → clear attempts & lock
        resetAttempts();
        localStorage.removeItem(LS_LOCK_UNTIL);

        sessionStorage.setItem("User", response.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.token}`;

        if (loginData.remember) localStorage.setItem(LS_REMEMBER_EMAIL, email);
        else localStorage.removeItem(LS_REMEMBER_EMAIL);

        // === SUCCESS PULSE ===
        setSuccessPulse(true);
        // small delay to let animation play before navigation
        const dest =
          response.role === "student"
            ? "/cli/home"
            : response.role === "admin"
            ? "/main/found-items"
            : null;

        if (!dest) {
          // unknown role fallback (shouldn't happen often)
          setSuccessPulse(false);
          showBanner("Unknown user role.");
          return;
        }

        // wait 500ms then navigate
        setTimeout(() => {
          navigate(dest);
        }, 500);

        return; // exit handler; don't fall through to finally password clear
      } else {
        handleFailedAttempt();
      }
    } catch (err) {
      if (err.response?.status === 403) {
      showBanner(
        "Account Suspended",
        "Your account has been suspended. Please contact the administrator for assistance."
      );
    } else if (err.response?.status === 401) {
      handleFailedAttempt("auth");
    } else {
    handleFailedAttempt("network");
  }
    } finally {
      // if we’re pulsing, keep password for a beat; otherwise clear as before
      if (!successPulse) {
        setSubmitting(false);
        setLoginData((prev) => ({ ...prev, password: "" }));
      }
    }
  }

  function handleFailedAttempt(kind = "auth") {
    const current = getAttempts() + 1;
    setAttempts(current);

    if (current >= MAX_ATTEMPTS) {
      const until = now() + LOCK_MS;
      localStorage.setItem(LS_LOCK_UNTIL, String(until));
      setLockedUntil(until);
      startCountdown(until);

      showBanner(
        "Incorrect email or password and login limit exceeded!",
        "Please try again when the countdown reaches zero."
      );
      setSubmitting(false);
      setLoginData((prev) => ({ ...prev, password: "" }));
      return;
    }

    showBanner("Incorrect email or password", "Please try again.");
    setSubmitting(false);
    setLoginData((prev) => ({ ...prev, password: "" }));
  }

  const isLocked = Boolean(lockedUntil && lockedUntil > now());
  const loginDisabled = submitting || isLocked || successPulse;

  return (
    <Card className={`container-card ${successPulse ? "card-success-pulse" : ""}`}>
      <div className="login-container">
        <p className="login-title">SIGN IN YOUR ACCOUNT</p>

        {(errors.bannerTitle || errors.bannerDesc) && (
          <Alert
            className="general-alert"
            type="error"
            showIcon
            message={errors.bannerTitle}
            description={
              <div className="alert-desc">
                {errors.bannerDesc}
                {isLocked && (
                  <div className="countdown">
                    Try again in <strong>{secondsLeft}</strong> second
                    {secondsLeft === 1 ? "" : "s"}…
                  </div>
                )}
              </div>
            }
          />
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="login-email" className="login-label">E-MAIL</label>
          <Input
            id="login-email"
            className={`login-inputs ${errors.email ? "has-error" : ""}`}
            size="large"
            placeholder="juandelacruz@gmail.com"
            type="email"
            name="email"
            value={loginData.email}
            onChange={handleChange}
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            disabled={loginDisabled}
          />
          {errors.email && <div id="email-error" className="field-error">{errors.email}</div>}

          <label htmlFor="login-password" className="login-label">PASSWORD</label>
          <Input.Password
            id="login-password"
            className={`login-inputs ${errors.password ? "has-error" : ""}`}
            size="large"
            placeholder="********"
            name="password"
            value={loginData.password}
            onChange={handleChange}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            disabled={loginDisabled}
          />
          {errors.password && <div id="password-error" className="field-error">{errors.password}</div>}

          <div className="login-chk-forgot">
            <label htmlFor="login-remember" className="remember-wrap">
              <Checkbox
                id="login-remember"
                name="remember"
                checked={loginData.remember}
                onChange={handleChange}
                disabled={loginDisabled}
              />
              <span className="remember-text">REMEMBER ME</span>
            </label>

            <Link to="/forgot" className="forgot-link">FORGOT PASSWORD?</Link>
          </div>

          <Button
            id="login-btn"
            size="large"
            className={`login-btn ${successPulse ? "success-pulse" : ""}`}
            type="primary"
            htmlType="submit"
            loading={submitting}
            disabled={loginDisabled}
          >
            {successPulse ? "WELCOME!" : isLocked ? "LOCKED" : "LOGIN"}
          </Button>
        </form>

        <p className="login-to-register">
          Don&apos;t have an account? <Link to="/register">SIGN UP HERE</Link>
        </p>
      </div>
    </Card>
  );
}

export default LoginForm;
