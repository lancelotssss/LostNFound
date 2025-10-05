import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message } from "antd";
import { jwtDecode } from "jwt-decode";
import {
  getClaimReport,
  getClaimDetails,
  approveClaim,
} from "../api";

const { Column } = Table;

export const AdminClaims = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimDetails, setClaimDetails] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Decode JWT once
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
    }
  }, []);

  // Fetch lost_found_db data
  const fetchData = async () => {
    const token = sessionStorage.getItem("User");
    if (!token) return message.error("Not authorized");

    const res = await getClaimReport(token);
    if (res.results) {
      const formatted = res.results.map((item, index) => ({
        key: item._id ? item._id.toString() : `row-${index}`,
        _id: item._id?.toString() || null,
        ...item,
        dateReported: item.dateReported
          ? new Date(item.dateReported).toLocaleString()
          : "N/A",
        dateFound: item.dateFound
          ? new Date(item.dateFound).toLocaleDateString()
          : "N/A",
        approvedBy: item.approvedBy || "No actions yet",
      }));
      setData(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Row click handler
  const handleRowClick = async (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);

    const token = sessionStorage.getItem("User");
    const details = await getClaimDetails(token, record._id);
    setClaimDetails(details);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    setClaimDetails(null);
  };

  const handleApprove = () => setApproveModal(true);
  const handleDeny = () => setDenyModal(true);

  // Confirm Approve
  const confirmApprove = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    const success = await approveClaim(
      token,
      selectedItem._id,
      "Claimed",
      user?.studentId
    );

    if (success) {
      message.success("Item approved successfully!");
      setApproveModal(false);
      setIsModalVisible(false);
      fetchData();
    } else {
      message.error("Failed to approve item.");
    }
    setConfirmLoading(false);
  };

  // Confirm Deny
  const confirmDeny = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    const success = await approveClaim(
      token,
      selectedItem._id,
      "Claim Denied",
      user?.studentId
    );

    if (success) {
      message.success("Item denied successfully!");
      setDenyModal(false);
      setIsModalVisible(false);
      fetchData();
    } else {
      message.error("Failed to deny item.");
    }
    setConfirmLoading(false);
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
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
      </Table>

      {/* Main Modal */}
      <Modal
        title={selectedItem ? selectedItem.title : "Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1100}
        maskClosable={false}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {selectedItem && (
          <div style={{ display: "flex", gap: 24 }}>
            {/* Left Panel - Lost/Found Info */}
            <div style={{ flex: 1 }}>
              <h3>Lost/Found Item Information</h3>
              {selectedItem.photoUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Image src={selectedItem.photoUrl} width={220} />
                </div>
              )}
              <Descriptions bordered column={1} size="middle">
                <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
                <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
                <Descriptions.Item label="Report Type">{selectedItem.reportType}</Descriptions.Item>
                <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
                <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
                <Descriptions.Item label="Brand">{selectedItem.itemBrand}</Descriptions.Item>
                <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
                <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
                <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
                <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
                <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
                <Descriptions.Item label="Date Found">{selectedItem.dateFound}</Descriptions.Item>
                <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
              </Descriptions>
            </div>

            {/* Right Panel - Claim Info */}
            <div style={{ flex: 1 }}>
              <h3>Claim Information</h3>
              {claimDetails ? (
                <>
                  {claimDetails.photoUrl && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <Image src={claimDetails.photoUrl} width={200} />
                    </div>
                  )}
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Claim ID">{claimDetails.cid}</Descriptions.Item>
                    <Descriptions.Item label="Claimer ID">{claimDetails.claimerId}</Descriptions.Item>
                    <Descriptions.Item label="Claim Status">{claimDetails.claimStatus}</Descriptions.Item>
                    <Descriptions.Item label="Reason">{claimDetails.reason}</Descriptions.Item>
                    <Descriptions.Item label="Admin Decision By">{claimDetails.adminDecisionBy}</Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {new Date(claimDetails.createdAt).toLocaleString()}
                    </Descriptions.Item>
                  </Descriptions>
                </>
              ) : (
                <p style={{ color: "gray" }}>No claim record found for this item.</p>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Button type="primary" onClick={handleApprove} disabled={selectedItem?.status === "Claimed"}>
            Approve
          </Button>
          <Button danger onClick={handleDeny} disabled={selectedItem?.status === "Claim Denied"}>
            Deny
          </Button>
          <Button onClick={handleModalClose}>Close</Button>
        </div>
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
      >
        <p>Are you sure you want to approve this claim?</p>
      </Modal>

      {/* Deny Modal */}
      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to deny this claim?</p>
      </Modal>
    </>
  );
};
