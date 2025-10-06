// src/components/NavBar.js
import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  FileAddOutlined,
  SearchOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { logOutUser } from "../api";

export const pageDataClient = [
  { key: "home", name: "Home", path: "/cli/home", icon: <HomeOutlined /> },
  { key: "report", name: "Report Item", path: "/cli/report", icon: <FileAddOutlined /> },
  // Your router shows results under /cli/search/result. If you also have a search page,
  // you can add it too. For now we link to the results route you’re using.
  // { key: "search", name: "Search", path: "/cli/search/result", icon: <SearchOutlined /> },
  { key: "settings", name: "User Settings", path: "/cli/settings", icon: <SettingOutlined /> },
  { key: "logout", name: "Logout", icon: <LogoutOutlined /> },
];

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);

  async function handleLogout() {
    const token = sessionStorage.getItem("User");
    if (!token) return;
    const res = await logOutUser(token);
    if (res?.success) {
      sessionStorage.removeItem("User");
      navigate("/");
    } else {
      alert("Logout failed");
    }
  }

  const items = useMemo(
    () =>
      pageDataClient.map((m) => ({
        key: m.key,
        icon: m.icon,
        label: m.path ? <Link to={m.path}>{m.name}</Link> : m.name,
      })),
    []
  );

  const onClick = ({ key }) => {
    if (key === "logout") handleLogout();
  };

  // Highlight the active item based on current URL
  const selectedKeys = useMemo(() => {
    const match = pageDataClient.find(
      (m) => m.path && location.pathname.startsWith(m.path)
    );
    return [match?.key ?? pageDataClient[0].key];
  }, [location.pathname]);

  return (
    <Menu
      mode="inline"
      items={items}
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      onClick={onClick}
      style={{ borderRight: 0 }}   // remove fixed width; Sider controls width
      theme="dark"                 // dark menu to fit the blue sider
    />
  );
}
