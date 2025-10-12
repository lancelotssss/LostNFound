import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {editPasswordClient } from "../api";
import { Modal } from "antd";

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
import { useNavigate } from "react-router-dom";





// Helper: get initials from a full name
const getInitials = (fname = "", lname = "") => {
  const first = fname?.trim()?.charAt(0) || "";
  const last = lname?.trim()?.charAt(0) || "";
  return (first + last).toUpperCase();
};





const { Title, Text } = Typography;

export function UserSettings() {

  const nav = useNavigate();
  const [user, setUser] = useState({});
  const [formData, setFormData] = useState({
    studentId: "",
    email: "",
    name: "",
    status: "",
    createdAt: "",
    phone: "",
    password: "",
    fname: "",
    lname: ""
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
 



 
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };


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
        lname: decodedUser.lname || "",
        fname: decodedUser.fname || ""
      }));
    }
    loadUserData();
  }, []);

  
 async function handlePasswordSave() {
  const { oldPassword, newPassword, confirmPassword } = passwordForm;

  
  if (newPassword !== confirmPassword) {
    return Modal.error({
      title: "Password Mismatch",
      content: "New password and confirmation do not match.",
    });
  }


  Modal.confirm({
    title: "Confirm Password Change",
    content: "Are you sure you want to update your password?",
    okText: "Yes",
    cancelText: "No",
    async onOk() {
      try {
        const token = sessionStorage.getItem("User");
        if (!token) return alert("User not logged in.");

        const response = await editPasswordClient({ oldPassword, newPassword }, token);

        if (!response.success) {
          return Modal.error({
            title: "Error",
            content: response.message || "Failed to update password.",
          });
        }

        
        Modal.success({
          title: "Success",
          content: "Password updated successfully!",
        });

        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setIsPasswordEditing(false);
        sessionStorage.removeItem("User");
        nav("/");

      } catch (err) {
        console.error("Error updating password:", err);
        Modal.error({
          title: "Error",
          content: "Error updating password. Please try again.",
        });
      }
    },
  });
}

/*
  const handleDeleteUser = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
 
    try {
      const token = sessionStorage.getItem("User");
      if (!token) return alert("User not logged in.");
 
      const response = await deleteUser(token);
 
      if (response.success) {
        alert("User deleted successfully!");
        sessionStorage.removeItem("User");
        nav("/");
      } else {
        alert(response.message || "Failed to delete user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Error deleting user");
    }
  };
*/
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
            {user?.fname || user?.lname ? (
              <Avatar size={64} style={{ backgroundColor: '#014F86' }}>
                {getInitials(user.fname, user.lname)}
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
                    {user?.status
                      ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                      : "—"}
                  </Tag>
                </div>
              </div>
            </Space>

            <Divider />
              
            
            <Descriptions column={1} size="middle" labelStyle={{ width: 140 }}>
              <Descriptions.Item label="Student ID">
                {user?.studentId || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                {user?.phone || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Joined">{joined}</Descriptions.Item>
            </Descriptions>

            <Divider />


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
                style={{fontFamily:"Poppins"}}
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
                style={{fontFamily:"Poppins"}}
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
                style={{fontFamily:"Poppins"}}
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
