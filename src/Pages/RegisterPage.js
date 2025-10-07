import React, { useState, useEffect } from "react";
import { createUser } from "../api";
import { useNavigate } from "react-router-dom";
import { Card, Input, Select, Button, Image, Typography, message, Modal } from "antd";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import "./styles/RegisterPage.css";
const { Title } = Typography;
export default function RegisterPage2() {
  // --------------------------------------------------------------------------------
  // --- JACOB CODES --- loading notification after mag register
  // setSubmitting pang set after pindutin yung register
  const [loading, setLoading] = useState(true); // page loader
  const [submitting, setSubmitting] = useState(false); 

  // --------------------------------------------------------------------------------

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
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

  const [isTermsVisible, setIsTermsVisible] = useState(false);
  const [isPrivacyVisible, setIsPrivacyVisible] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
  e.preventDefault();

  const {
    fname,
    lname,
    email,
    studentId,
    phone,
    password,
    confirmPassword,
    birthday,
    gender,
  } = registerData;

  const newErrors = {};

  // Required field validation
  if (!fname.trim()) newErrors.fname = "First name is required.";
  if (!lname.trim()) newErrors.lname = "Last name is required.";
  if (!email.trim()) newErrors.email = "Email is required.";
  if (!studentId.trim()) newErrors.studentId = "Student ID is required.";
  if (!phone.trim()) newErrors.phone = "Phone number is required.";
  if (!birthday.trim()) newErrors.birthday = "Birthday is required.";
  if (!gender.trim()) newErrors.gender = "Gender is required.";
  if (!password.trim()) newErrors.password = "Password is required.";
  if (!confirmPassword.trim()) newErrors.confirmPassword = "Confirm your password.";

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    newErrors.email = "Please enter a valid email address.";
  }

  // Phone validation
  const phoneRegex = /^(09\d{9}|\+639\d{9})$/;
  if (phone && !phoneRegex.test(phone)) {
    newErrors.phone = "Invalid phone number";
  }

  // Password rules
  if (password && password.length < 8) {
    newErrors.password = "Password must be at least 8 characters long.";
  }

  // Password match
  if (password !== confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match.";
  }

  // If there are validation errors, display them
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  // No errors — proceed
  setErrors({});
  const newRegisterData = {
    ...registerData,
    name: [registerData.fname, registerData.mname, registerData.lname, registerData.suffix]
      .filter(Boolean)
      .join(" "),
  };

  try {
    const response = await createUser(newRegisterData);

    if (response?.success) {
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

      setSubmitting(true);
      showCenteredSuccess("Account created! You can sign in now.");
      setTimeout(() => navigate("/"), 1800);
      return;
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
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000); 
    return () => clearTimeout(t);
  }, []);
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
  // --- END JACOB CODES ---
  /* ------------------------------------------------- TOAST NOTIFICATION -------------------------------------------------  */
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

  return (
    <div className="register-container">
      {contextHolder}
      <Card className="register-card">
        {/* --- HEADER --- */}

        <div className="register-header">
          <Image
            src="/assets/kit.png"
            alt="Toolbox"
            width={55}
            preview={false}
            className="register-header__icon"
          />

          <Title
            level={5}
            className="register-header__title"
            style={{ margin: 0 }}
          >
            CREATE YOUR ACCOUNT
          </Title>

          <p className="register-header__desc">
            Create your FoundHub account to report lost items, post found items,
            and claim matches.
          </p>
        </div>

        <form className="reg-form" onSubmit={handleSubmit}>
          <h2 id="firstHeader" className="reg-form-headers">
            PERSONAL INFORMATION
          </h2>

          {/* -------------------------------------------------------------------------------------------------------------------- */}
          {/* Name block */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
            }}
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
              {errors.fname && <div style={{ color: "red", marginTop: 4 }}>{errors.fname}</div>}
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
              {errors.mname && <div style={{ color: "red", marginTop: 4 }}>{errors.mname}</div>}
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
              {errors.lname && <div style={{ color: "red", marginTop: 4 }}>{errors.lname}</div>}
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

          {/* -------------------------------------------------------------------------------------------------------------------- */}
          <h2 id="secondHeader" className="reg-form-headers">
            ACCOUNT INFORMATION
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
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
                onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, ""); // remove non-numeric
                handleChange({ target: { name: "phone", value } });
              }}
                size="large"
              />
              {errors.phone && <div style={{ color: "red", marginTop: 4 }}>{errors.phone}</div>}

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
              <Input
                name="birthday"
                type="date"
                value={registerData.birthday}
                onChange={handleChange}
                size="large"
              />
              {errors.birthday && <div style={{ color: "red", marginTop: 4 }}>{errors.birthday}</div>}
            </div>
          </div>

          {/* Gender */}
          <div
            style={{
              marginTop: 25,
            }}
          >
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
            {errors.gender && <div style={{ color: "red", marginTop: 4 }}>{errors.gender}</div>}
          </div>

          {/* -------------------------------------------------------------------------------------------------------------------- */}
          {/* Passwords */}
          <h2 id="thirdHeader" className="reg-form-headers">
            PERSONAL INFORMATION
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 25,
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
              {errors.password && <div style={{ color: "red", marginTop: 4 }}>{errors.password}</div>}
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
              {errors.confirmPassword && <div style={{ color: "red", marginTop: 4 }}>{errors.confirmPassword}</div>}
            </div>
          </div>

          {errors.general && (
            <div style={{ color: "red", marginTop: 12 }}>{errors.general}</div>
          )}

          <Button
            id="registerBtn"
            type="primary"
            size="large"
            htmlType="submit"
            style={{ width: "100%", marginTop: 40 }}
          >
            REGISTER
          </Button>

          <div className="register-footer">
          <p className="register-legal">
          By registering, you confirm that the information provided is
          accurate and complete. You agree to comply with FoundHub’s{" "}
          <a onClick={() => setIsTermsVisible(true)} style={{ color: "#1677ff", cursor: "pointer" }}>
            Terms &amp; Conditions </a>{" "} and acknowledge our{" "}
            <a onClick={() => setIsPrivacyVisible(true)} style={{ color: "#1677ff", cursor: "pointer" }}>
              Privacy Policy
            </a>, including how we handle your personal data.
        </p>

            <p className="register-auth">
              Already have an account? <Link to="/">SIGN IN</Link>
            </p>

            <Modal
          title="Terms and Conditions"
          open={isTermsVisible}
          onCancel={() => setIsTermsVisible(false)}
          footer={null}
          width={800}
          centered
          bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
>
          <p><strong>Effective Date:</strong> October 6, 2025</p>
          <p>Welcome to FoundHub. By using our Lost and Found service, you agree to these Terms...</p>
          <ul>
            <li>Use the service responsibly and provide accurate information.</li>
            <li>Do not upload illegal, offensive, or false content.</li>
            <li>Claims are verified by administrators before approval.</li>
            <li>We are not responsible for lost, damaged, or stolen items.</li>
          </ul>
          <p>
            Continued use of FoundHub means you accept the full terms of service.
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
      <p><strong>Effective Date:</strong> October 6, 2025</p>
      <p>
        FoundHub values your privacy. This policy explains how we collect,
        use, and protect your data:
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
    Your continued use of FoundHub constitutes acceptance of this Privacy Policy.
  </p>
</Modal>

          </div>
          

        </form>
      </Card>
    </div>
  );
}
