import { useEffect, useState } from "react";
import { Layout as AntLayout, Avatar, Space, Typography, Image, Dropdown, Modal } from "antd";
import { UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";

import { jwtDecode } from "jwt-decode";
import { useNavigate, Outlet } from "react-router-dom";
import { NavBarAdmin } from "./NavBarAdmin";
import "../../src/Pages/styles/Layout.css"; // <--- CSS GALING SA LAYOUT.JS PREEEEEE
import { logOutUser } from "../api";

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;



const getInitials = (fname = "", lname = "") => {
    const first = fname?.trim()?.charAt(0) || "";
    const last = lname?.trim()?.charAt(0) || "";
    return (first + last).toUpperCase();
  };



export function AdminLayout() {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (!token) return navigate("/login");
    try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        if (decoded?.role !== "admin") navigate("/login"); // non-admins
    } catch {
        navigate("/login");
    }
    }, [navigate]);
// Modal confirm
const { confirm } = Modal;

async function handleLogout() {
  const token = sessionStorage.getItem("User");
  if (!token) return;
  try {
    const res = await logOutUser(token);
    if (res?.success) {
      sessionStorage.removeItem("User");
      navigate("/login");
    } else {
      // fallback if API returns error
      sessionStorage.removeItem("User");
      navigate("/login");
    }
  } catch {
    sessionStorage.removeItem("User");
    navigate("/login");
  }
}

function showLogoutConfirm() {
  confirm({
    title: "Are you sure you want to log out?",
    okText: "Log out",
    cancelText: "Cancel",
    centered: true,
    onOk: handleLogout,
  });
}

const userMenuItems = [
  { key: "settings", label: "User Settings", icon: <SettingOutlined /> },
  { type: "divider" },
  { key: "logout", label: "Logout", danger: true, icon: <LogoutOutlined /> },
];

const onUserMenuClick = ({ key }) => {
  if (key === "settings") navigate("/main/settings");
  if (key === "logout") showLogoutConfirm();
};


return (
  <AntLayout className="app-layout" trigger={null}>
    <Header className="app-header">
      <div className="sider-logo">
        <Image
          src="/assets/foundhub1.png"
          alt="FoundHub"
          preview={false}
          className="register-header__icon logo-desktop"
        />
        <Image
          src="/assets/kit.png"
          alt="FoundHub Small"
          preview={false}
          className="register-header__icon logo-mobile"
        />
      </div>

      <Space size="middle" align="center">
        <Title className="goodday" level={5} style={{ margin: 0, textTransform: "uppercase" }}>
          GOOD DAY, {user?.fname || "Admin"}!
        </Title>

<Dropdown
  trigger={["click"]}
  placement="bottomRight"
  menu={{ items: userMenuItems, onClick: onUserMenuClick }}
>
  {user?.fname || user?.lname ? (
    <Avatar
      className="avatar-pill"
      size="large"
      style={{ backgroundColor: "#014F86", cursor: "pointer" }}
      title="Account"
    >
      {getInitials(user.fname, user.lname)}
    </Avatar>
  ) : (
    <Avatar
      className="avatar-pill"
      size="large"
      icon={<UserOutlined />}
      style={{ cursor: "pointer" }}
      title="Account"
    />
  )}
</Dropdown>

      </Space>
    </Header>

    <AntLayout className="app-body">
      <Sider
        className="app-sider"
        breakpoint="lg"
        collapsedWidth={64}
        width={220}
      >
        <div className="sider-scroll">
          <NavBarAdmin />
        </div>
      </Sider>

      <Content className="app-content">
        <Outlet />
      </Content>
    </AntLayout>
  </AntLayout>
);

} 

