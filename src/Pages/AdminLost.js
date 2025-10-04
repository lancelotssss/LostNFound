// AdminDisplayData.js
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message } from "antd";
import { getLostReport, approveLost } from "../api";
import { jwtDecode } from "jwt-decode";

const { Column } = Table;

export const AdminLost = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);

  // 🔹 Load admin user
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
  }, []);

  // 🔹 Fetch Lost reports
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in");
        return;
      }
      const res = await getLostReport(token);
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          _id: item._id ? item._id.toString() : null,
          ...item,
          dateReported: item.dateReported
            ? new Date(item.dateReported).toLocaleString()
            : "N/A",
          startDate: item.startDate
            ? new Date(item.startDate).toLocaleDateString()
            : "N/A",
          endDate: item.endDate
            ? new Date(item.endDate).toLocaleDateString()
            : "N/A",
        }));
        setData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching lost items:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Modal logic
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

  // 🔹 Confirm Approve
  const confirmApprove = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await approveLost(selectedItem._id, "Active", user.studentId, token);
      message.success("Lost item approved successfully!");
      setApproveModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to approve lost item.");
    } finally {
      setConfirmLoading(false);
    }
  };

  // 🔹 Confirm Deny
  const confirmDeny = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await approveLost(selectedItem._id, "Denied", user.studentId, token);
      message.success("Lost item denied successfully!");
      setDenyModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to deny lost item.");
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table
        dataSource={data}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="TID" dataIndex="tid" key="tid" />
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Start Date" dataIndex="startDate" key="startDate" />
        <Column title="End Date" dataIndex="endDate" key="endDate" />
      </Table>

      {/* Main Modal */}
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
              <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Report Type">{selectedItem.reportType}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="primary" onClick={handleApprove}>
                Approve
              </Button>
              <Button danger onClick={handleDeny}>
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
        <p>Are you sure you want to approve this lost report?</p>
      </Modal>

      {/* Deny Confirmation */}
      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to deny this lost report?</p>
      </Modal>
    </>
  );
};
