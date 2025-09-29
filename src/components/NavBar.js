import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppstoreOutlined, MailOutlined } from "@ant-design/icons";
import { Menu } from "antd";

export const pageDataClient = [
  { name: "Home", path: "/cli/home" },
  { name: "Report Item", path: "/cli/report" },
  { name: "Claim Form", path: "/cli/claim" },
  { name: "Profile", path: "/cli/profile" },
  { name: "Settings", path: "/cli/settings" },
  { name: "Logout" }, // No path, triggers logout
];

export function NavBar() {
  const navigate = useNavigate();
  const [stateOpenKeys, setStateOpenKeys] = useState([]);

  const handleLogout = () => {
    sessionStorage.removeItem("User");
    navigate("/");
  };

  const onOpenChange = (openKeys) => {
    setStateOpenKeys(openKeys);
  };

  // Build Menu items
  const items = pageDataClient.map((page, index) => ({
    key: String(index + 1),
    icon: index % 2 === 0 ? <MailOutlined /> : <AppstoreOutlined />,
    label: page.path ? <Link to={page.path}>{page.name}</Link> : page.name, // Logout has no path
  }));

  // Menu click handler
  const onClickMenu = ({ key }) => {
    const clickedPage = pageDataClient[Number(key) - 1];
    if (clickedPage.name === "Logout") {
      handleLogout();
    }
  };

  return (
    <Menu
      mode="inline"
      defaultSelectedKeys={["1"]}
      openKeys={stateOpenKeys}
      onOpenChange={onOpenChange}
      onClick={onClickMenu} // <-- handle clicks here
      style={{ width: 256 }}
      items={items}
    />
  );
}
