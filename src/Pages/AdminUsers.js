import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Typography, Tag } from "antd";
import { getUsers, updateUser } from "../api";
import { jwtDecode } from "jwt-decode";
import "./styles/ant-input.css";

const { Column } = Table;
const { Text } = Typography;

export const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [viewRole, setViewRole] = useState("student"); 

  useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

const fetchData = async (role = viewRole) => {
  try {
    const token = sessionStorage.getItem("User");
    if (!token) {
      alert("You must be logged in");
      return;
    }

    const res = await getUsers(token, role);
    if (res && Array.isArray(res.results)) {
      setData(res.results);
    } else {
      setData([]);
    }
  } catch (err) {
    console.error("Error fetching users:", err);
  }
};

useEffect(() => {
  fetchData(viewRole);
}, [viewRole]);

  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleApprove = () => setApproveModal(true);
  const handleDeny = () => setDenyModal(true);

  const confirmApprove = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await updateUser(selectedItem._id, "Active", user.studentId, token);
      message.success("User has been set to active successfully!");
      setApproveModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to activate user.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmDeny = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await updateUser(selectedItem._id, "Suspended", user.studentId, token);
      message.success("User has been suspended!");
      setDenyModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to suspend user.");
    } finally {
      setConfirmLoading(false);
    }
  };

  
 const filteredData = data
  .filter((item) => item.role?.toLowerCase() === viewRole)
  .filter((item) => {
    const search = searchText.toLowerCase();
    return (
      item.sid?.toLowerCase().includes(search) ||
      item.name?.toLowerCase().includes(search) ||
      item.studentId?.toLowerCase().includes(search)
    );
  });

  const STATUS_COLORS = {
    suspended: "volcano",
    active: "green"
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type={viewRole === "student" ? "primary" : "default"}
            disabled={viewRole === "student"}
            onClick={() => setViewRole("student")}
          >
            Students
          </Button>
          <Button
            type={viewRole === "admin" ? "primary" : "default"}
            disabled={viewRole === "admin"}
            onClick={() => setViewRole("admin")}
          >
            Admins
          </Button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <Input
            className="poppins-input"
            placeholder="Search by ID or name"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
          <Button onClick={fetchData}>Refresh</Button>
        </div>
      </div>

      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        rowKey="_id"
      >
        <Column title="NAME" dataIndex="name" key="name" />
        <Column
          title={viewRole === "student" ? "STUDENT ID" : "EMPLOYEE ID"}
          dataIndex="studentId"
          key="studentId"
        />
        <Column title="EMAIL" dataIndex="email" key="email" />
        <Column title="PHONE" dataIndex="phone" key="phone" />
        <Column
          title="STATUS"
          dataIndex="status"
          key="status"
          render={(status) => {
              const color = STATUS_COLORS[status?.toLowerCase()] || "default";
              return (
                <Tag color={color} style={{ fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                  {status ? status.toUpperCase() : "N/A"}
                </Tag>
              );
            }}
        />
        <Column
          title="ROLE"
          dataIndex="role"
          key="role"
          render={(role) =>
            role ? role.charAt(0).toUpperCase() + role.slice(1) : ""
          }
        />
      </Table>

      {/* (modals unchanged) */}
      <Modal
        title={selectedItem ? selectedItem.title : "User Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        maskClosable={false}
      >
        {selectedItem && (
          <>
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="SID"><Text copyable style={{fontFamily: "Poppins"}}>{selectedItem.sid}</Text></Descriptions.Item>
              <Descriptions.Item label={viewRole === "student" ? "Student ID" : "Employee ID"}>
                {selectedItem.studentId}
              </Descriptions.Item>
              <Descriptions.Item label="Name">{selectedItem.name}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedItem.email}</Descriptions.Item>
              <Descriptions.Item label="Phone">{selectedItem.phone}</Descriptions.Item>
              <Descriptions.Item label="Last Logged In">
                
                  {selectedItem.lastLogin
                    ? new Date(selectedItem.lastLogin).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "N/A"}
                
              </Descriptions.Item>

              <Descriptions.Item label="Last Updated">
                
                  {selectedItem.updatedAt
                    ? new Date(selectedItem.updatedAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "N/A"}
              
              </Descriptions.Item>

              <Descriptions.Item label="Created At">
                
                  {selectedItem.createdAt
                    ? new Date(selectedItem.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "N/A"}
              
              </Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button
                type="primary"
                onClick={handleApprove}
                disabled={selectedItem.status === "Active" || selectedItem.status === "active"}
              >
                Activate
              </Button>
              <Button
                danger
                onClick={handleDeny}
                disabled={selectedItem.role?.toLowerCase() === "admin" || selectedItem.status?.toLowerCase() === "suspended"}
              >
                Suspend
              </Button>
              <Button onClick={handleModalClose}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Confirm Modals (unchanged) */}
      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
      >
        <p>Are you sure you want to activate this user?</p>
      </Modal>

      <Modal
        title="Confirm Suspension"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to suspend this user?</p>
      </Modal>
    </>
  );
};
