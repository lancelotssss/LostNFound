import { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { editAdmin, editPasswordAdmin } from "../api";
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
  Modal,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import "./styles/UserSettings.css";
import { useNavigate } from "react-router-dom";





// GET INITIALS -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const getInitials = (fname = "", lname = "") => {
  const first = fname?.trim()?.charAt(0) || "";
  const last = lname?.trim()?.charAt(0) || "";
  return (first + last).toUpperCase();
};

const { Title, Text } = Typography;



















export function AdminSettings() {
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

  const nav = useNavigate()
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

  async function handleSave(e) {
    e.preventDefault();

    if (formData.phone === user.phone) {
      Modal.info({
        title: "No Changes",
        content: "No changes detected in phone number.",
      });
      return;
    }

    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        Modal.error({ title: "Not authorized", content: "Please sign in again." });
        return;
      }

      const response = await editAdmin({ phone: formData.phone }, token);

      if (!response.success) {
        Modal.error({
          title: "Update Failed",
          content: response.message || "Phone number could not be updated.",
        });
      } else {
        Modal.success({ title: "Success", content: "Phone number updated successfully!" });
        setUser({ ...user, phone: formData.phone });
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error updating phone:", err);
      Modal.error({ title: "Error", content: "Error updating phone." });
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
        Modal.warning({
          title: "Missing Fields",
          content: "All password fields are required.",
          onOk: () => {
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
          },
        });
        return;
      }

    if (newPassword !== confirmPassword) {
      Modal.error({
        title: "Password Mismatch",
        content: "New passwords do not match.",
        onOk: () => {
          setPasswordForm((prev) => ({ oldPassword: "", newPassword: "", confirmPassword: "" }));
        },
      });
      return;
    }

    Modal.confirm({
      title: "Confirm Password Change",
      content: "Are you sure you want to update your password?",
      okText: "Yes",
      cancelText: "No",
      async onOk() {
        try {
          const token = sessionStorage.getItem("User");
          if (!token) {
            Modal.error({ title: "Not authorized", content: "Please sign in again." });
            return;
          }

          const response = await editPasswordAdmin(passwordForm, token);

          if (!response.success) {
            Modal.error({
              title: "Update Failed",
              content: response.message || "Password could not be updated.",
            });
          } else {
            Modal.success({ title: "Success", content: "Password updated successfully!" });
            setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setIsPasswordEditing(false);
            sessionStorage.removeItem("User");
            nav("/login");
          }
        } catch (err) {
          console.error("Error updating password:", err);
          Modal.error({ title: "Error", content: "Error updating password." });
        }
      },
    });
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
        {/* LEFT: Account Info -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */}
        <Col xs={24} md={12}>
          <Card className="settings-card" bordered>
            <Space align="center" size={16} className="settings-header">
              {user?.name ? (
                <Avatar size={64} style={{ backgroundColor: "#014F86" }}>
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
              <Descriptions.Item label="Employee ID">
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


        {/* RIGHT: Security / Password -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= */}
        <Col xs={24} md={12}>
          <Card className="settings-card" bordered>
            <Space align="center" size={12} className="settings-header">
              <LockOutlined style={{ fontSize: 22 }} />
              <Title level={4} style={{ margin: 0 }}>
                Security
              </Title>
            </Space>

            <Divider />

            <form onSubmit={handlePasswordSave} className="settings-form">
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
                style={{ fontFamily: "Poppins" }}
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
                style={{ fontFamily: "Poppins" }}
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
                style={{ fontFamily: "Poppins" }}
              />

              <div className="settings-actions">
                {!isPasswordEditing ? (
                  <>
                    <Button type="default" onClick={() => setIsPasswordEditing(true)}>
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
                    <Button htmlType="submit" type="primary">
                      Apply
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminSettings;
