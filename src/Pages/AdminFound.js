import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Select, Typography } from "antd";
import { getFoundReport, approveFound } from "../api";
import { jwtDecode } from "jwt-decode";
import "./styles/ant-input.css";
const { Column } = Table;
const { Option } = Select;
const { Text } = Typography;


export const AdminFound = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
 
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
      const res = await getFoundReport(token);
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
        key: item._id ? item._id.toString() : `row-${index}`,
        _id: item._id ? item._id.toString() : null, 
        ...item,
        dateReported: item.dateReported
          ? new Date(item.dateReported).toLocaleString()
          : "N/A",
        dateFound: item.dateFound
          ? new Date(item.dateFound).toLocaleDateString()
          : "N/A",
          approvedBy: item.approvedBy ? item.approvedBy : "No actions yet"
      }));
      console.log("Formatted Data: ", formattedData)
        setData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching found items:", err);
    }
  };

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
    await approveFound(selectedItem._id, "Listed", user.studentId, token);
    message.success("Item approved successfully!");
    setApproveModal(false);
    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error(err);
    message.error("Failed to approve item.");
  } finally {
    setConfirmLoading(false);
  }
};

const confirmDeny = async () => {
  setConfirmLoading(true);
  const token = sessionStorage.getItem("User");
  try {
    await approveFound(selectedItem._id, "Denied", user.studentId, token); 
    message.success("Item denied successfully!");
    setDenyModal(false);
    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error(err);
    message.error("Failed to deny item.");
  } finally {
    setConfirmLoading(false);
  }
};

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    const matchesSearch =
      item.tid?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.keyItem?.toLowerCase().includes(search) ||
      item.itemBrand?.toLowerCase().includes(search);

    const matchesStatus =
      !statusFilter || item.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });


  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
      <Input
        className="poppins-input"
        placeholder="Search by TID, Category, or Key Item"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
        width: 300}}
        allowClear
      />
      {/* 🟩 Status Filter Dropdown */}
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 200 }}
          allowClear
        >
          <Option value="">All Status</Option>
          <Option value="Reviewing">Reviewing</Option>
          <Option value="Listed">Listed</Option>
          <Option value="Reviewing Claim">Reviewing Claim</Option>
          <Option value="Claim Approved">Claim Approved</Option>
          <Option value="Returned">Returned</Option>
          <Option value="Claim Rejected">Claim Rejected</Option>
          <Option value="Claim Denied">Denied</Option>
          <Option value="Deleted">Deleted</Option>
        </Select>
  
    </div>
      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="CATEGORY" dataIndex="category" key="category" />
        <Column title="ITEM NAME" dataIndex="keyItem" key="keyItem" />
        <Column title="BRAND" dataIndex="itemBrand" key="itemBrand" />
        <Column title="LOCATION" dataIndex="location" key="location" />
        <Column title="STATUS" dataIndex="status" key="status" />
        <Column title="DATE REPORTED" dataIndex="dateReported" key="dateReported" />
        <Column title="DATE FOUND" dataIndex="dateFound" key="dateFound" />
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
              <Descriptions.Item label="TID">
                <Text copyable style={{ fontFamily: "Poppins" }}>{selectedItem.tid}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Date Found">{selectedItem.dateFound}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="primary" onClick={handleApprove}   disabled={!(selectedItem.status === "Reviewing" || selectedItem.status === "Denied")}>
                Approve
              </Button>
              <Button danger onClick={handleDeny}  disabled={!(selectedItem.status === "Listed" || selectedItem.status === "Reviewing")}>
                Deny
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
        <p>Are you sure you want to approve this report?</p>
      </Modal>

      {/* Deny Confirmation */}
      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to deny this report?</p>
      </Modal>
    </>
  );
};
