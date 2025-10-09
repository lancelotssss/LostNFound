
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Avatar, Space, Typography, Image } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { jwtDecode } from "jwt-decode";
import { NavBar } from "./NavBar";
import "../../src/Pages/styles/Layout.css";
import {  Button  } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from "react-router-dom";




const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;





export function Layout() {

const navigate = useNavigate(); // add this near top of component

const [collapsed, setCollapsed] = useState(false);


    // PANG KUHA NG USER NAME =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
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

    const initials = (name) =>
      (name || "")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-



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
    <Title
      className="goodday"
      level={5}
      style={{ margin: 0, textTransform: "uppercase" }}
    >
      GOOD DAY, {user?.name || "Guest"}!
    </Title>

    {user?.name ? (
      <Avatar
        size="large"
        style={{ backgroundColor: "#014F86", cursor: "pointer" }}
        onClick={() => navigate("/cli/settings")}
        title="Go to Settings"
      >
        {initials(user.name)}
      </Avatar>
    ) : (
      <Avatar
        size="large"
        icon={<UserOutlined />}
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/cli/settings")}
        title="Go to Settings"
      />
    )}
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
            <NavBar />
          </div>
        </Sider>

        <Content className="app-content">
          <Outlet />
        </Content>

      </AntLayout>



    </AntLayout>
  );
}
