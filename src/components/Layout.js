import React, { useEffect, useState, useMemo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Layout as AntLayout, Avatar, Typography, Image, Button, Menu, Modal, Dropdown } from "antd";
import { UserOutlined, HomeOutlined, FileAddOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import "../../src/Pages/styles/LayoutUser.css";
import { logOutUser } from "../api";

const { Header, Content } = AntLayout;
const { Title } = Typography;

export const pageDataClient = [
  { key: "home", name: "Home", path: "/cli/home", icon: <HomeOutlined /> },
  { key: "report", name: "Report Item", path: "/cli/report", icon: <FileAddOutlined /> },
  { key: "settings", name: "User Settings", path: "/cli/settings", icon: <SettingOutlined /> },
  { key: "logout", name: "Logout", icon: <LogoutOutlined /> },
];

export function Layout() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch {
      setUser(null);
    }
  }, []);



  // GET INITIALS ________________________________________________________________________________
  const getInitials = (fname = "", lname = "") => {
    const first = fname?.trim()?.charAt(0) || "";
    const last = lname?.trim()?.charAt(0) || "";
    return (first + last).toUpperCase();
  };



  // MODAL ________________________________________________________________________________
  const { confirm } = Modal;

  // LOGOUT ________________________________________________________________________________
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





  // DROP DOWN ________________________________________________________________________________
  const location = useLocation();
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
  const selectedKeys = useMemo(() => {
    const match = topPages.find((m) => m.path && location.pathname.startsWith(m.path));
    return [match?.key ?? topPages[0].key];
  }, [location.pathname]);



  // AVATAR ________________________________________________________________________________
  const userMenuItems = [
    {
      key: "settings",
      label: "User Settings",
      icon: <SettingOutlined />, 
    },
    { type: "divider" },
    {
      key: "logout",
      label: "Logout",
      danger: true,
      icon: <LogoutOutlined />,
    },
  ];

  const onUserMenuClick = ({ key }) => {
    if (key === "settings") navigate("/cli/settings");
    if (key === "logout") showLogoutConfirm();
  };





  //  RETURN ____________________________________________________________________________________________________________________________________________________________
  return (





    <AntLayout className="app-layout" trigger={null}>
      
      {/* HEADER ________________________________________________________________________________ */}
      <Header className="app-header-client">




        {/* INNER HEADER ________________________________________________________________________________ */}
        <div className="header-inner">

          {/* LOGO ________________________________________________________________________________ */}
          <div className="header-left">
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



          {/* MENU ________________________________________________________________________________ */}
          <Menu
            mode="horizontal"
            items={itemsTop}
            selectedKeys={selectedKeys}
            theme="light"
            className="header-menu"
          />



          {/* AVATAR / DROP DOWN >>>> ________________________________________________________________________________ */}
          <div className="header-right">
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{ items: userMenuItems, onClick: onUserMenuClick }}
            >
              {user?.fname || user?.lname ? (
                <Avatar className="avatar-pill" size="large" title="Account">
                  {getInitials(user.fname, user.lname)}
                </Avatar>
              ) : (
                <Avatar className="avatar-pill" size="large" icon={<UserOutlined />} title="Account" />
              )}
            </Dropdown>
          </div>





        </div> {/* ;;;; end ng header-inner ;;;; */}





      </Header>  {/* ;;;; end ng header ;;;; */}





      {/* BODY ________________________________________________________________________________ */}
      <AntLayout className="app-body">
        <Content className="app-content">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>






  ); {/* ;;;; END NG REUTN ;;;; */}





}



