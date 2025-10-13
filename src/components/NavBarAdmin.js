import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppstoreOutlined, MailOutlined, LogoutOutlined, SearchOutlined, FileSearchOutlined, HistoryOutlined, DatabaseOutlined, FormOutlined, InboxOutlined,
  DashboardOutlined, FileProtectOutlined, TeamOutlined, UserAddOutlined, FileTextOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu, Button, Modal } from "antd";
import { logOutUser } from "../api";
import "../../src/Pages/styles/NavBar.css";

const pageDataAdmin = [
  { key: "dashboard", name: "Dashboard", path: "/main/dashboard", icon: <DashboardOutlined /> },

  // MGA CHILDREN TO
  { key: "review-found",  group: "review", name: "Review Found Items", path: "/main/found-items", icon: <InboxOutlined /> },
  { key: "review-lost",   group: "review", name: "Review Lost Items",  path: "/main/lost-items", icon: <SearchOutlined /> },
  { key: "review-claims", group: "review", name: "Review Claims",      path: "/main/claim-items", icon: <FileProtectOutlined /> },

  // Main
  { key: "report",   name: "Report Item",  path: "/main/report",  icon: <FormOutlined /> },
  { key: "storage",  name: "Storage",      path: "/main/storage", icon: <DatabaseOutlined /> },
  { key: "history",  name: "History",      path: "/main/history", icon: <HistoryOutlined /> },

  // Accounts group
  { key: "users",     group: "accounts", name: "Accounts",     path: "/main/users", icon: <TeamOutlined /> },
  { key: "createadm", group: "accounts", name: "Create Admin", path: "/main/admin", icon: <UserAddOutlined /> },

  { key: "logs",     name: "Activity Logs", path: "/main/logs", icon: <FileTextOutlined /> },
  { key: "settings", name: "User Settings", path: "/main/settings", icon: <SettingOutlined /> },

  { key: "logout",   name: "Logout", icon: <LogoutOutlined /> },
];

export function NavBarAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { confirm } = Modal;


  const reviewChildren = useMemo(
  () =>
    pageDataAdmin
      .filter((p) => p.group === "review")
      .map((p) => ({
        key: p.key,
        icon: p.icon, 
        label: <Link to={p.path}>{p.name}</Link>,
        path: p.path,
      })),
  []
);

// --- ACCOUNT SUBMENU ---
const accountChildren = useMemo(
  () =>
    pageDataAdmin
      .filter((p) => p.group === "accounts")
      .map((p) => ({
        key: p.key,
        icon: p.icon, 
        label: <Link to={p.path}>{p.name}</Link>,
        path: p.path,
      })),
  []
);

  const dashboardItem = useMemo(() => {
    const p = pageDataAdmin.find((x) => x.key === "dashboard");
    return {
      key: p.key,
      icon: p.icon ?? <AppstoreOutlined />,
      label: <Link to={p.path}>{p.name}</Link>,
      path: p.path,
    };
  }, []);

  const restTopPages = useMemo(
    () =>
      pageDataAdmin
        .filter((p) => !p.group && p.key !== "dashboard" && p.key !== "logout")
        .map((p, idx) => ({
          key: p.key,
          icon: p.icon ?? (idx % 2 === 0 ? <MailOutlined /> : <AppstoreOutlined />),
          label: p.path ? <Link to={p.path}>{p.name}</Link> : p.name,
          path: p.path,
        })),
    []
  );

  const items = useMemo(
  () => [
    dashboardItem,
    {
      key: "review",
      icon: <SearchOutlined />,
      label: "Review Items",
      children: reviewChildren,
    },
    {
      key: "accounts",
      icon: <MailOutlined />,
      label: "Manage User",
      children: accountChildren,
    },
    ...restTopPages.filter((p) => p.key !== "users" && p.key !== "createadm"), 
  ],
  [dashboardItem, reviewChildren, accountChildren, restTopPages]
);

  const flatItems = useMemo(() => {
  const flat = [
    dashboardItem,
    ...reviewChildren,
    ...accountChildren,
    ...restTopPages,
  ];
  return flat.filter(Boolean);
}, [dashboardItem, reviewChildren, accountChildren, restTopPages]); 

  // determine selected key by current URL
  const selectedKeys = useMemo(() => {
    const match =
      flatItems.find((it) => it.path && location.pathname.startsWith(it.path)) ??
      dashboardItem;
    return [match.key];
  }, [flatItems, dashboardItem, location.pathname]);

  // keep review submenu open when a review child is active
  const reviewChildKeys = useMemo(() => reviewChildren.map((c) => c.key), [reviewChildren]);
  const isReviewActive = reviewChildKeys.includes(selectedKeys[0]);

  // expand on desktop and avoid flicker on mobile 
  const [isNarrow, setIsNarrow] = useState(() =>
    window.matchMedia("(max-width: 992px)").matches
  );
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 992px)");
    const handler = (e) => setIsNarrow(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler);
      else mql.removeListener(handler);
    };
  }, []);

  // controlled open state on desktop; auto-open review if a child is selecte
  const [openKeys, setOpenKeys] = useState(["review"]);
  const accountChildKeys = useMemo(() => accountChildren.map((c) => c.key), [accountChildren]);
  const isAccountActive = accountChildKeys.includes(selectedKeys[0]);

useEffect(() => {
  if (!isNarrow) {
    const newOpenKeys = [];
    if (isReviewActive) newOpenKeys.push("review");
    if (isAccountActive) newOpenKeys.push("accounts");
    setOpenKeys(newOpenKeys);
  }
}, [isReviewActive, isAccountActive, isNarrow]);

  // logout with confirm 
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

  return (
    <div className="sider-rail">
      <Menu
        mode="inline"
        theme="dark"
        className="NavBarMenu menu-top"
        selectedKeys={selectedKeys}                 
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
          onClick={showLogoutConfirm}
          className="logout-btn"
        >
          <span className="logout-text">Logout</span>
        </Button>
      </div>
    </div>
  );
}
