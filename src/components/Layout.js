import React from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Avatar, Space, Typography, Image } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { NavBar } from "./NavBar";
// import "./Layout.css"; // ⬅️ add this import
import "../../src/Pages/styles/Layout.css"

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

export function Layout() {
  return (
    <AntLayout className="app-layout">


      {/* Full-width header at the very top */}
      <Header className="app-header">


        <div className="sider-logo">
          {/* -----> DESKTOP LOGO */}
          <Image
          src="/assets/foundhub1.png"
          alt="FoundHub"
          preview={false}
          className="register-header__icon logo-desktop"
          />

          {/* -----> MOBILE LOGO */} 
          <Image
          src="/assets/kit.png"
          alt="FoundHub Small"
          preview={false}
          className="register-header__icon logo-mobile"
          />
        </div>


        <Space>
          <Title level={5} style={{ margin: 0 }}>Dashboard</Title>
          <Avatar size="large" icon={<UserOutlined />} />
        </Space>


      </Header>

      {/* Body: Sider + Content below the header */}
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
