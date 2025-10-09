import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input  } from "antd";
import { getUsers  } from "../api";
import { jwtDecode } from "jwt-decode";

const { Column } = Table;

export const AdminUsers = () => {
    const [data, setData] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [user, setUser] = useState(null);
    const [searchText, setSearchText] = useState("");


useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("User"); 
          if (!token) {
            alert("You must be logged in");
            return;
          }
          const res = await getUsers(token)
          if (res && Array.isArray(res.results)) {
            setData(res.results);
            } else {
            console.error("Unexpected response structure:", res);
            setData([]);
    }

        }catch (err) {
      console.error("Error fetching found items:", err);
    }
    }

    useEffect(() => {
    fetchData();
  }, []);

  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };


  

  const filteredData = data.filter((item) => {
  const search = searchText.toLowerCase();
  return (
    item.sid?.toLowerCase().includes(search) ||
    item.name?.toLowerCase().includes(search) ||
    item.studentId?.toLowerCase().includes(search)
  );
});


  return (
    <>
         <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
  <Input
    placeholder="Search by ID or name"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    style={{ width: 300 }}
    allowClear
  />
  
</div>

      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Name" dataIndex="name" key="name" />
        <Column title="Student ID:" dataIndex="studentId" key="studentId" />
        <Column title="Email" dataIndex="email" key="email" />
        <Column title="Phone" dataIndex="phone" key="phone" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Role" dataIndex="role" key="role" />
      </Table>
    </>
  )
  }

