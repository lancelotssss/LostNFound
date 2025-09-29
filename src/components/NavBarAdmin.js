import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { AppstoreOutlined, MailOutlined, SettingOutlined } from "@ant-design/icons";
import { Menu } from "antd";


const pageDataAdmin = [
    {
        name: "Review Found Items",
        path: "/main/found-items"
    },
    {
        name: "Review Lost Items",
        path: "/main/lost-items"
    },
    {
        name: "Review Claims",
        path: "/main/claim-items"
    },
    {
        name: "Activity Logs",
        path: "/main/logs"
    },

    { name: "Logout" }, // No path, triggers logout
];


export function NavBarAdmin() {
  const navigate = useNavigate()
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

  const handleLogout = () => {
    sessionStorage.removeItem("User");
    navigate("/");
  };

  const onClickMenu = ({ key }) => {
      const clickedPage = pageDataAdmin[Number(key) - 1];
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
