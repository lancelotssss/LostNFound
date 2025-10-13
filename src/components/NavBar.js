// src/components/NavBar.js
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HomeOutlined, FileAddOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { logOutUser } from "../api";
import { Menu, Modal, Button } from "antd";
import "../../src/Pages/styles/NavBar.css";







export const pageDataClient = [
  { key: "home", name: "Home", path: "/cli/home", icon: <HomeOutlined /> },
  { key: "report", name: "Report Item", path: "/cli/report", icon: <FileAddOutlined /> },
  { key: "settings", name: "User Settings", path: "/cli/settings", icon: <SettingOutlined /> },
  { key: "logout", name: "Logout", icon: <LogoutOutlined /> }, 
];







export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);
  const { confirm } = Modal;

  async function handleLogout() {
    const token = sessionStorage.getItem("User");
    if (!token) return;
    const res = await logOutUser(token);
    if (res?.success) {
      sessionStorage.removeItem("User");
      navigate("/login");
    } else {
      alert("Logout failed");
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

  // Split menus (top excludes logout)
  const topPages = pageDataClient.filter((m) => m.key !== "logout");
  const itemsTop = useMemo(
    () =>
      topPages.map((m) => ({
        key: m.key,
        icon: m.icon,
        label: m.path ? <Link to={m.path}>{m.name}</Link> : m.name,
      })),
    []
  );

  // Highlight active item based on URL
  const selectedKeys = useMemo(() => {
    const match = topPages.find((m) => m.path && location.pathname.startsWith(m.path));
    return [match?.key ?? topPages[0].key];
  }, [location.pathname]);

  return (
    <div className="sider-rail">
      {/* Scrollable top menu */}
      <Menu
        mode="inline"
        items={itemsTop}
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onOpenChange={setOpenKeys}
        theme="dark"
        className="NavBarMenu menu-top"
      />

      

      {/* Fixed bottom section with Button */}
      <div className="menu-bottom">
        <Button
          block
          size="large"
          type="default"
          danger
          icon={<LogoutOutlined />}
          onClick={showLogoutConfirm}
          className="logout-btn"
        >
          <span className="logout-text">Logout</span>
        </Button>
      </div>
    </div>
  );
}
