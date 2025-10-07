import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { editClient, editPasswordClient } from "../api";

import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Tag,
  Avatar,
  Space,
  Input,
  Button,
  Divider,
} from "antd";
import { UserOutlined, PhoneOutlined, LockOutlined } from "@ant-design/icons";
import "./styles/UserSettings.css";





// Helper: get initials from a full name
const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  const first = parts[0][0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};





const { Title, Text } = Typography;

export function UserSettings() {


  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    studentId: "",
    email: "",
    name: "",
    status: "",
    createdAt: "",
    phone: "",
    password: "",
  });

  const [isEditing, setIsEditing] = useState(false);               
  const [isPasswordEditing, setIsPasswordEditing] = useState(false); 

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      setFormData((prev) => ({
        ...prev,
        studentId: decodedUser.studentId || "",
        email: decodedUser.email || "",
        name: decodedUser.name || "",
        status: decodedUser.status || "",
        createdAt: decodedUser.createdAt || "",
        phone: decodedUser.phone || "",
      }));
    }
    loadUserData();
  }, []);

  
  async function handleSave() {
    try {
      if (formData.phone === user.phone) {
        alert("No changes detected in phone number.");
        return;
      }
      const token = sessionStorage.getItem("User");
      if (!token) return;

      const response = await editClient({ phone: formData.phone }, token);

      if (!response.success) {
        alert("Phone number could not be updated.");
      } else {
        alert("Phone number updated successfully!");
        setUser({ ...user, phone: formData.phone });
        setFormData((prev) => ({ ...prev, phone: formData.phone }));
        setIsEditing(false);
        
      }
    } catch (err) {
      console.error("Error updating phone:", err);
      alert("Error updating phone");
    }
  }

  async function handlePasswordSave() {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("All password fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      const response = await editPasswordClient(passwordForm, token);

      if (!response.success) {
        alert("Password could not be updated.");
      } else {
        alert("Password updated successfully!");
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setIsPasswordEditing(false);
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("Error updating password");
    }
  }

  const joined = user?.createdAt
    ? new Date(user.createdAt)
        .toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Manila",
        })
        .replace(",", "")
    : "—";

  const statusColor =
    (user?.status || "").toLowerCase() === "active"
      ? "green"
      : (user?.status || "").toLowerCase() === "pending"
      ? "orange"
      : "default";

  return (
    <div className="settings-wrap">
      <Row gutter={[16, 16]}>
        {/* LEFT: Account Info */}
        <Col xs={24} md={12}>
          <Card className="settings-card" bordered>
            <Space align="center" size={16} className="settings-header">
            {user?.name ? (
              <Avatar size={64} style={{ backgroundColor: '#014F86' }}>
                {getInitials(user.name)}
              </Avatar>
            ) : (
              <Avatar size={64} icon={<UserOutlined />} />
            )}
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  {user?.name || "—"}
                </Title>
                <Text type="secondary">{user?.email || "—"}</Text>
                <div>
                  <Tag color={statusColor} style={{ marginTop: 6 }}>
                    {user?.status || "—"}
                  </Tag>
                </div>
              </div>
            </Space>

            <Divider />

            <Descriptions column={1} size="middle" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Student ID">
                {user?.studentId || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Joined">{joined}</Descriptions.Item>
            </Descriptions>

            <Divider />

            {/* Contact (no form submit; explicit Apply button) */}
            <div className="settings-form">
              <Title level={5} style={{ marginBottom: 12 }}>
                Contact
              </Title>

              <label className="settings-label" htmlFor="phone">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                prefix={<PhoneOutlined />}
                disabled={!isEditing}              
                className="settings-input"
              />

              <div className="settings-actions">
                {!isEditing ? (
                  <>
                    <Button
                      type="default"
                      onClick={() => setIsEditing(true)} 
                    >
                      Edit
                    </Button>
                    <Button type="primary" disabled>
                      Apply
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="default"
                      onClick={() => {
                        
                        setFormData((prev) => ({ ...prev, phone: user.phone || "" }));
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSave}          
                    >
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* RIGHT: Security / Password */}
        <Col xs={24} md={12}>
          <Card className="settings-card" bordered>
            <Space align="center" size={12} className="settings-header">
              <LockOutlined style={{ fontSize: 22 }} />
              <Title level={4} style={{ margin: 0 }}>
                Security
              </Title>
            </Space>

            <Divider />

            {/* Always visible, disabled until Edit; explicit Apply button */}
            <div className="settings-form">
              <label className="settings-label" htmlFor="oldPassword">
                Old Password
              </label>
              <Input.Password
                id="oldPassword"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordChange}
                placeholder="Old Password"
                disabled={!isPasswordEditing}
                className="settings-input"
              />

              <label className="settings-label" htmlFor="newPassword">
                New Password
              </label>
              <Input.Password
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="New Password"
                disabled={!isPasswordEditing}
                className="settings-input"
              />

              <label className="settings-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <Input.Password
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm New Password"
                disabled={!isPasswordEditing}
                className="settings-input"
              />

              <div className="settings-actions">
                {!isPasswordEditing ? (
                  <>
                    <Button
                      type="default"
                      onClick={() => setIsPasswordEditing(true)} 
                    >
                      Edit
                    </Button>
                    <Button type="primary" disabled>
                      Apply
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="default"
                      onClick={() => {
                        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                        setIsPasswordEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      onClick={handlePasswordSave}  
                    >
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
