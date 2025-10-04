import React from "react";
import { Outlet } from "react-router-dom";
import { Layout as AntLayout, Avatar, Space, Typography, Image } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { NavBar } from "./NavBar";

const { Header, Sider, Content } = AntLayout;
const { Title } = Typography;

export function Layout() {
  return (

   <AntLayout style={{ minHeight: "100vh", overflowX: "hidden" }}>
      {/* LEFT SIDEBAR */}

     <Sider
        className="app-sider"
         breakpoint="lg"
         collapsedWidth={64}
         width={220}

        style={{
          background: "#063970",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingInline: 16,
            color: "#fff",
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          <Image
            src="/assets/foundhub1.png"
            alt="Toolbox"
            width={100}
            preview={false}
            className="register-header__icon"
          />
        </div>

        <div style={{ height: "calc(100% - 64px)" }}>

         <NavBar />
        </div>
      </Sider>

      <AntLayout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 16,
            height: 64,
          }}
        >
          <div />
          <Space>
            <Title level={5} style={{ margin: 0 }}>Dashboard</Title>
            <Avatar size="large" icon={<UserOutlined />} />
          </Space>
        </Header>


       <Content className="app-content" style={{ padding: 16, background: "#f5f5f5", overflowX: "auto" }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}
