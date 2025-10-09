import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input  } from "antd";
import { getUsers, updateUser  } from "../api";
import { jwtDecode } from "jwt-decode";

const { Column } = Table;

export const AdminUsers = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
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

       {/* Main modal */}
            <Modal
              title={selectedItem ? selectedItem.title : "Lost Item Details"}
              open={isModalVisible}
              onCancel={handleModalClose}
              footer={null}
              width={700}
              maskClosable={false}
            >
              {selectedItem && (
                <>
                  {selectedItem.photoUrl && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <Image src={selectedItem.photoUrl} width={250} />
                    </div>
                  )}
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="SID">{selectedItem.sid}</Descriptions.Item>
                    <Descriptions.Item label="Student ID">{selectedItem.studentId}</Descriptions.Item>
                    <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
                    <Descriptions.Item label="Email">{selectedItem.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{selectedItem.phone}</Descriptions.Item>
                    <Descriptions.Item label="Last Logged In">{selectedItem.lastLogin}</Descriptions.Item>
                    <Descriptions.Item label="Last Updated">{selectedItem.updatedAt}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{selectedItem.createdAt}</Descriptions.Item>
                  </Descriptions>
      
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
                    <Button type="primary" onClick={handleApprove}   disabled={selectedItem.status === "Active" }>
                      Activate
                    </Button>
                    <Button danger onClick={handleDeny}  disabled={selectedItem.status === "Suspended"}>
                      Suspend
                    </Button>
                    <Button onClick={handleModalClose}>Cancel</Button>
                  </div>
                </>
              )}
            </Modal>
      
            {/* Approve Confirmation */}
            <Modal
              title="Confirm Approval"
              open={approveModal}
              onOk={confirmApprove}
              confirmLoading={confirmLoading}
              onCancel={() => setApproveModal(false)}
            >
              <p>Are you sure you want to activate this student?</p>
            </Modal>
      
            {/* Deny Confirmation */}
            <Modal
              title="Confirm Denial"
              open={denyModal}
              onOk={confirmDeny}
              confirmLoading={confirmLoading}
              onCancel={() => setDenyModal(false)}
            >
              <p>Are you sure you want to suspend this student?</p>
            </Modal>
    </>
  )
  }

