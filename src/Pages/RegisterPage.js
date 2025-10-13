import { useEffect, useState } from "react";
import { createUser } from "../api";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  Input,
  Select,
  Button,
  Image,
  Typography,
  message,
  Modal,
  Spin,
  Alert,
  DatePicker,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./styles/RegisterPagesu.css";
import dayjs from "dayjs";

const { Title } = Typography;

const isValidEmail = (s) => /^\S+@\S+\.\S+$/.test(String(s || "").trim());
const isValidPHPhone = (s) =>
  /^(09\d{9}|\+639\d{9})$/.test(String(s || "").trim());

export default function RegisterPage2() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successPulse, setSuccessPulse] = useState(false);

  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);

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
    details: "User registered successfully.",
  });

  const [errors, setErrors] = useState({
    fname: "",
    lname: "",
    email: "",
    studentId: "",
    phone: "",
    birthday: "",
    gender: "",
    password: "",
    confirmPassword: "",
    general: "",
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const clearGeneral = () => setErrors((p) => ({ ...p, general: "" }));

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData((prev) => ({ ...prev, [name]: value }));
    if (name in errors) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (errors.general) clearGeneral();
  }
  function handlePhoneChange(e) {
    const value = e.target.value.replace(/[^0-9+]/g, "");
    setRegisterData((prev) => ({ ...prev, phone: value }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
    if (errors.general) clearGeneral();
  }

  const showCenteredSuccess = (text) => {
    const h =
      window.innerHeight || document.documentElement.clientHeight || 800;
    const msgTop = Math.max(0, Math.round(h / 2 - 24));
    message.config({ top: 0 });
    messageApi.open({
      type: "success",
      content: text,
      duration: 2.2,
      style: { marginTop: msgTop, textAlign: "center" },
    });
    setTimeout(() => message.config({ top: 8 }), 0);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting || successPulse) return;

    const {
      fname,
      mname,
      lname,
      suffix,
      email,
      studentId,
      phone,
      password,
      confirmPassword,
      birthday,
      gender,
    } = registerData;

    const newErrors = {};
    if (!fname.trim()) newErrors.fname = "First name is required.";
    if (!lname.trim()) newErrors.lname = "Last name is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!studentId.trim()) newErrors.studentId = "Student ID is required.";
    if (!phone.trim()) newErrors.phone = "Phone number is required.";
    if (!birthday) newErrors.birthday = "Birthday is required.";
    if (!gender) newErrors.gender = "Gender is required.";
    if (!password) newErrors.password = "Password is required.";
    if (!confirmPassword) newErrors.confirmPassword = "Confirm your password.";

    if (email && !isValidEmail(email))
      newErrors.email = "Please enter a valid email address.";
    if (phone && !isValidPHPhone(phone)) newErrors.phone = "Use 09xxxxxxxxx";
    if (password && password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return;
    }

    const payload = {
      ...registerData,
      name: [fname, mname, lname, suffix].filter(Boolean).join(" "),
    };

    setSubmitting(true);
    clearGeneral();
    try {
      const response = await createUser(payload);
      if (response?.success) {
        setSuccessPulse(true);
        showCenteredSuccess("Account created! You can sign in now.");
        setTimeout(() => { navigate("/login"); }, 500);
        return;
      }
      setErrors((prev) => ({
        ...prev,
        general: response?.message || "Registration failed.",
      }));
    } catch (err) {
      if (err?.response?.status === 400) {
        const human = err.response.data?.message || "";
        const msg = human.toLowerCase();
        if (msg.includes("email")) setErrors((p) => ({ ...p, email: human }));
        else if (msg.includes("student"))
          setErrors((p) => ({ ...p, studentId: human }));
        else setErrors((p) => ({ ...p, general: human || "Bad request." }));
      } else {
        setErrors((p) => ({
          ...p,
          general: "Something went wrong, try again.",
        }));
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin
          indicator={<LoadingOutlined spin />}
          size="large"
          tip="Loading..."
        />
      </div>
    );
  }

  const disableAll = submitting || successPulse;

  return (
    <div className="register-container">
      {contextHolder}

      <Card
        className={`register-card ${successPulse ? "card-success-pulse" : ""}`}
      >
        <div className="register-header">
          <Image
            src="/assets/kit.png"
            alt="Toolbox"
            width={55}
            preview={false}
            className="register-header__icon"
          />
          <Title level={5} className="register-header__title">
            CREATE YOUR ACCOUNT
          </Title>
          <p className="register-header__desc">
            Create your FoundHub account to report lost items, post found items,
            and claim matches.
          </p>
        </div>

        {errors.general && (
          <Alert
            className="general-alert"
            type="error"
            showIcon
            message="Registration error"
            description={errors.general}
          />
        )}

        <form className="reg-form" onSubmit={handleSubmit} noValidate>
          <h2 className="reg-form-headers" id="firstHeader">
            PERSONAL INFORMATION
          </h2>

          <div className="form-grid two">
            <div className="field">
              <label>First Name</label>
              <Input
                name="fname"
                placeholder="First Name"
                value={registerData.fname}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.fname ? "has-error" : ""}
                aria-invalid={!!errors.fname}
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error">{errors.fname || ""}</div>
            </div>

            <div className="field">
              <label>Middle Name</label>
              <Input
                name="mname"
                placeholder="Middle Name"
                value={registerData.mname}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error"></div>
            </div>

            <div className="field">
              <label>Last Name</label>
              <Input
                name="lname"
                placeholder="Last Name"
                value={registerData.lname}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.lname ? "has-error" : ""}
                aria-invalid={!!errors.lname}
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error">{errors.lname || ""}</div>
            </div>

            <div className="field">
              <label>Suffix</label>
              <Input
                name="suffix"
                placeholder="Jr., Sr., III"
                value={registerData.suffix}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error"></div>
            </div>
          </div>

          <h2 className="reg-form-headers" id="secondHeader">
            ACCOUNT INFORMATION
          </h2>

          <div className="form-grid two">
            <div className="field">
              <label>Email</label>
              <Input
                name="email"
                type="email"
                placeholder="email@example.com"
                value={registerData.email}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.email ? "has-error" : ""}
                aria-invalid={!!errors.email}
                autoComplete="email"
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error">{errors.email || ""}</div>
            </div>

            <div className="field">
              <label>Phone</label>
              <Input
                name="phone"
                placeholder="09xxxxxxxxx or +639xxxxxxxxx"
                value={registerData.phone}
                onChange={handlePhoneChange}
                size="large"
                disabled={disableAll}
                className={errors.phone ? "has-error" : ""}
                aria-invalid={!!errors.phone}
                inputMode="numeric"
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error">{errors.phone || ""}</div>
            </div>

            <div className="field">
              <label>Student ID</label>
              <Input
                name="studentId"
                placeholder="Student ID"
                value={registerData.studentId}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.studentId ? "has-error" : ""}
                aria-invalid={!!errors.studentId}
                style={{ fontFamily: "Poppins" }}
              />
              <div className="field-error">{errors.studentId || ""}</div>
            </div>

            <div className="field">
              <label>Birthdate</label>
              <DatePicker
                name="birthday"
                value={
                  registerData.birthday ? dayjs(registerData.birthday) : null
                }
                onChange={(date) =>
                  handleChange({
                    target: {
                      name: "birthday",
                      value: date ? date.format("YYYY-MM-DD") : "",
                    },
                  })
                }
                size="large"
                disabled={disableAll}
                className={errors.birthday ? "has-error" : ""}
                aria-invalid={!!errors.birthday}
                style={{ width: "100%", fontFamily: "Poppins" }}
                placeholder="Select your birthdate"
                format="YYYY-MM-DD"
                disabledDate={(current) => current && current.isAfter(dayjs())}
                showToday={false}
                defaultPickerValue={dayjs("2005-01-01")}
              />
              <div className="field-error" style={{ fontFamily: "Poppins" }}>
                {errors.birthday || ""}
              </div>
            </div>
          </div>

          <div className="field mt-25">
            <label>Gender</label>
            <Select
              size="large"
              placeholder="Select Gender"
              value={registerData.gender || undefined}
              onChange={(value) => {
                setRegisterData((p) => ({ ...p, gender: value }));
                if (errors.gender)
                  setErrors((prev) => ({ ...prev, gender: "" }));
                if (errors.general) clearGeneral();
              }}
              disabled={disableAll}
              className={`fullwidth ${errors.gender ? "has-error-select" : ""}`}
              options={[
                { value: "", label: "Select Gender" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Rather not say", label: "Rather not say" },
              ]}
            />
            <div className="field-error">{errors.gender || ""}</div>
          </div>

          <h2 className="reg-form-headers" id="thirdHeader">
            SECURITY
          </h2>

          <div className="form-grid two">
            <div className="field">
              <label>Password</label>
              <Input.Password
                name="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.password ? "has-error" : ""}
                aria-invalid={!!errors.password}
                autoComplete="new-password"
              />
              <div className="field-error">{errors.password || ""}</div>
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <Input.Password
                name="confirmPassword"
                placeholder="Confirm Password"
                value={registerData.confirmPassword}
                onChange={handleChange}
                size="large"
                disabled={disableAll}
                className={errors.confirmPassword ? "has-error" : ""}
                aria-invalid={!!errors.confirmPassword}
                autoComplete="new-password"
              />
              <div className="field-error">{errors.confirmPassword || ""}</div>
            </div>
          </div>

          <Button
            id="registerBtn"
            type="primary"
            size="large"
            htmlType="submit"
            className={`register-btn ${successPulse ? "success-pulse" : ""}`}
            loading={submitting}
            disabled={submitting || successPulse}
          >
            {successPulse ? "WELCOME!" : "REGISTER"}
          </Button>

          <div className="register-footer">
            <p className="register-legal">
              By registering, you confirm that the information provided is
              accurate and complete. You agree to comply with FoundHub’s{" "}
              <a onClick={() => setIsTermsVisible(true)}>
                Terms &amp; Conditions
              </a>{" "}
              and acknowledge our{" "}
              <a onClick={() => setIsPrivacyVisible(true)}>Privacy Policy</a>.
            </p>

            <p className="register-auth">
              Already have an account? <Link to="/login">SIGN IN</Link>
            </p>
          </div>
        </form>
      </Card>

      <Modal
        title="Terms and Conditions"
        open={isTermsVisible}
        onCancel={() => setIsTermsVisible(false)}
        footer={null}
        width={800}
        centered
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <p>
          <strong>Effective Date:</strong> October 6, 2025
        </p>
        <p>
          Welcome to FoundHub. By using our Lost and Found service, you agree to
          these Terms...
        </p>
        <ul>
          <li>Use the service responsibly and provide accurate information.</li>
          <li>Do not upload illegal, offensive, or false content.</li>
          <li>Claims are verified by administrators before approval.</li>
          <li>We are not responsible for lost, damaged, or stolen items.</li>
        </ul>
        <p>
          For questions, contact <b>support@foundhub.com</b>.
        </p>
      </Modal>

      <Modal
        title="Privacy Policy"
        open={isPrivacyVisible}
        onCancel={() => setIsPrivacyVisible(false)}
        footer={null}
        width={800}
        centered
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        <p>
          <strong>Effective Date:</strong> October 6, 2025
        </p>
        <p>
          FoundHub values your privacy. This policy explains how we collect,
          use, and protect your data.
        </p>
        <ul>
          <li>We collect name, contact details, and item information.</li>
          <li>We use this data to process lost and found reports securely.</li>
          <li>We do not sell or rent personal information to third parties.</li>
          <li>
            You can request data deletion anytime by contacting
            privacy@foundhub.com.
          </li>
        </ul>
        <p>
          Your continued use of FoundHub constitutes acceptance of this Privacy
          Policy.
        </p>
      </Modal>
    </div>
  );
}
