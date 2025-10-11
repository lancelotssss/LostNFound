import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppstoreOutlined,
  MailOutlined,
  LogoutOutlined,
  SearchOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { Menu, Button } from "antd";
import "../../src/Pages/styles/NavBar.css";

const pageDataAdmin = [
  { name: "Dashboard", path: "/main/dashboard" },

  { name: "Review Found Items", path: "/main/found-items" },
  { name: "Review Lost Items", path: "/main/lost-items" },
  { name: "Review Claims", path: "/main/claim-items" },

  { name: "Report Item", path: "/main/report" },
  { name: "Storage", path: "/main/storage" },
  { name: "History", path: "/main/history" },
  { name: "Manage Users", path: "/main/users" },
  { name: "Create Admin", path: "/main/admin" },
  { name: "Activity Logs", path: "/main/logs" },
  { name: "User Settings", path: "/main/settings" },

  { name: "Logout" },
];

export function NavBarAdmin() {
  const navigate = useNavigate();

  // --- Group our 3 Review pages under one submenu ---
  const reviewNames = [
    "Review Found Items",
    "Review Lost Items",
    "Review Claims",
  ];

  const dashboardPage = pageDataAdmin.find((p) => p.name === "Dashboard");
  const dashboardItem = {
    key: "dashboard",
    icon: <AppstoreOutlined />,
    label: <Link to={dashboardPage.path}>{dashboardPage.name}</Link>,
  };

  const reviewChildren = pageDataAdmin
    .filter((p) => reviewNames.includes(p.name))
    .map((p, i) => ({
      key: `review-${i + 1}`,
      icon: <FileSearchOutlined />,
      label: <Link to={p.path}>{p.name}</Link>,
    }));

  const reviewGroup = {
    key: "review",
    icon: <SearchOutlined />,
    label: "Review Items",
    children: reviewChildren,
  };

  const restTopPages = pageDataAdmin
    .filter(
      (p) =>
        p.name !== "Dashboard" &&
        p.name !== "Logout" &&
        !reviewNames.includes(p.name)
    )
    .map((p, idx) => ({
      key: `top-${idx + 1}`,
      icon: idx % 2 === 0 ? <MailOutlined /> : <AppstoreOutlined />,
      label: p.path ? <Link to={p.path}>{p.name}</Link> : p.name,
    }));

  const items = [dashboardItem, reviewGroup, ...restTopPages];

  // ---------- Expand on desktop, avoid flicker on mobile ----------
  const [isNarrow, setIsNarrow] = useState(() =>
    window.matchMedia("(max-width: 992px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 992px)");
    const handler = (e) => setIsNarrow(e.matches);
    // modern
    if (mql.addEventListener) mql.addEventListener("change", handler);
    // safari/old
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  // Controlled open state only on desktop so it’s expanded by default + animates
  const [openKeys, setOpenKeys] = useState(["review"]);

  const handleLogout = () => {
    sessionStorage.removeItem("User");
    navigate("/");
  };

  return (
    <div className="sider-rail">
      <Menu
        mode="inline"
        theme="dark"
        className="NavBarMenu menu-top"
        defaultSelectedKeys={["dashboard"]}
        // Desktop: controlled (starts open = ['review'] and animates)
        // Mobile/collapsed: uncontrolled to prevent popup close/reopen flicker
        {...(isNarrow
          ? { defaultOpenKeys: ["review"] }
          : { openKeys, onOpenChange: setOpenKeys })}
        items={items}
      />

      <div className="menu-bottom">
        <Button
          block
          size="large"
          type="default"
          danger
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="logout-btn"
        >
          <span className="logout-text">Logout</span>
        </Button>
      </div>
    </div>
  );
}
