import React, { useState } from "react";
import { Link } from "react-router-dom";
import { pageDataAdmin } from "./pageDataAdmin";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";

export function NavBarAdmin() {
  // Dynamically build Menu items from pageDataClient
  const items = pageDataAdmin.map((page, index) => ({
    key: String(index + 1),
    icon: index % 2 === 0 ? <MailOutlined /> : <AppstoreOutlined />, // just example icons
    label: <Link to={page.path}>{page.name}</Link>,
  }));

  // Track open keys (for submenus if you add later)
  const [stateOpenKeys, setStateOpenKeys] = useState([]);

  const onOpenChange = (openKeys) => {
    setStateOpenKeys(openKeys);
  };

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={["1"]}
      openKeys={stateOpenKeys}
      onOpenChange={onOpenChange}
      style={{ width: 256 }}
      items={items}
    />
  );
}
