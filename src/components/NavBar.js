import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppstoreOutlined, MailOutlined } from "@ant-design/icons";
import { Menu } from "antd";
<<<<<<< HEAD
import { logOutUser } from "../api";
import axios from "axios";
=======
import { getAuditLogs } from "../api";
>>>>>>> 5975782edf760129c50247fd213a0c4c093ea6b3

export const pageDataClient = [
   {
        name: "Home",
        path: "/cli/home"
    },
    {
        name: "Report Item",
        path: "/cli/report"
    },
    {
        name: "Search Item",
        path: "/cli/search"
    },
    {
        name: "User Profile",
        path: "/cli/settings"
    },
  { name: "Logout" }, // No path, triggers logout
];

export function NavBar() {
  const navigate = useNavigate();
  const [stateOpenKeys, setStateOpenKeys] = useState([]);

  async function handleLogout() {
  const token = sessionStorage.getItem("User");
  if (!token) return;

  let response = await logOutUser(token);

  if (response.success) {
    sessionStorage.removeItem("User");
    navigate("/");
  } else {
    alert("Logout failed");
  }
}

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
