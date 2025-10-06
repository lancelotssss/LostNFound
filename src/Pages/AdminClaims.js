import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message } from "antd";
import { jwtDecode } from "jwt-decode";
import { getClaimReport, getClaimDetails, approveClaim, completeTransaction } from "../api";

const { Column } = Table;

export const AdminClaims = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState({ claim: null, foundItem: null, lostItem: null });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  
  useEffect(() => {
    const token = sessionStorage.getItem("User");
    if (token) setUser(jwtDecode(token));
  }, []);

  
  const fetchData = async () => {
    const token = sessionStorage.getItem("User");
    if (!token) return message.error("Not authorized");

    const res = await getClaimReport(token);
    if (res.results) {
      const formatted = res.results.map((item, index) => ({
        key: item._id ? item._id.toString() : `row-${index}`,
        _id: item._id?.toString() || null,
        ...item,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString()
          : "N/A",
      }));
      setData(formatted);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const handleRowClick = async (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);

    const token = sessionStorage.getItem("User");
    const detailsData = await getClaimDetails(token, record._id);
    setDetails(detailsData);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    setDetails({ claim: null, foundItem: null, lostItem: null });
  };

  const handleApprove = () => setApproveModal(true);
  const handleDeny = () => setDenyModal(true);

  const confirmApprove = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    const success = await approveClaim(
      token,
      selectedItem._id,
      "Claim Approved",
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

  const confirmDeny = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    const success = await approveClaim(
      token,
      selectedItem._id,
      "Claim Rejected",
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

  const handleComplete = async () => {
  setCompleteLoading(true);
  const token = sessionStorage.getItem("User");
  
  try {
    await completeTransaction(token, selectedItem._id, "Completed" ,user?.studentId);
    message.success("Transaction completed successfully!");
    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error("Error completing transaction:", err);
    message.error("Failed to complete transaction.");
  }
  
  setCompleteLoading(false);
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
        <Column title="Claim ID" dataIndex="cid" key="cid" />
        <Column title="Claimer ID" dataIndex="claimerId" key="claimerId" />
        <Column title="Claim Status" dataIndex="claimStatus" key="claimStatus" />
        <Column title="Created At" dataIndex="createdAt" key="createdAt" />
        <Column title="Admin Decision By" dataIndex="adminDecisionBy" key="adminDecisionBy" />
      </Table>

      {/* Details Modal */}
      <Modal
        title={selectedItem ? "Claim Details" : "Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1300}
        maskClosable={false}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {selectedItem && (
          <div style={{ display: "flex", gap: 24 }}>
            {/* Found Item */}
            <div style={{ flex: 1 }}>
              <h3>Found Item Information</h3>
              {details.foundItem?.photoUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Image src={details.foundItem.photoUrl} width={220} />
                </div>
              )}
              {details.foundItem ? (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="TID">{details.foundItem.tid}</Descriptions.Item>
                  <Descriptions.Item label="Title">{details.foundItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{details.foundItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Location">{details.foundItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Date Found">{new Date(details.foundItem.dateFound).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Status">{details.foundItem.status}</Descriptions.Item>
                </Descriptions>
              ) : <p>No found item data.</p>}
            </div>

            {/* Lost Item */}
            <div style={{ flex: 1 }}>
              <h3>Lost Item Reference</h3>
              {details.lostItem?.photoUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Image src={details.lostItem.photoUrl} width={220} />
                </div>
              )}
              {details.lostItem ? (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="TID">{details.lostItem.tid}</Descriptions.Item>
                  <Descriptions.Item label="Title">{details.lostItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{details.lostItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Location">{details.lostItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Date Reported">{new Date(details.lostItem.dateReported).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Status">{details.lostItem.status}</Descriptions.Item>
                </Descriptions>
              ) : <p style={{ color: "gray" }}>No linked lost item found.</p>}
            </div>

            {/* Claim Info */}
            <div style={{ flex: 1 }}>
              <h3>Claim Information</h3>
              {details.claim ? (
                <>
                  {details.claim.photoUrl && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <Image src={details.claim.photoUrl} width={200} />
                    </div>
                  )}
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Claim ID">{details.claim.cid}</Descriptions.Item>
                    <Descriptions.Item label="Claimer ID">{details.claim.claimerId}</Descriptions.Item>
                    <Descriptions.Item label="Claim Status">{details.claim.claimStatus}</Descriptions.Item>
                    <Descriptions.Item label="Reason">{details.claim.reason}</Descriptions.Item>
                    <Descriptions.Item label="Admin Decision By">{details.claim.adminDecisionBy}</Descriptions.Item>
                    <Descriptions.Item label="Created At">{new Date(details.claim.createdAt).toLocaleString()}</Descriptions.Item>
                  </Descriptions>
                </>
              ) : (
                <p style={{ color: "gray" }}>No claim record found.</p>
              )}
            </div>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
   <Button
  type="default"
  onClick={handleComplete}
  disabled={selectedItem?.claimStatus !== "Claim Approved"}
  loading={completeLoading}
>
  Complete
</Button>

<Button
  type="primary"
  onClick={handleApprove}
  disabled={
    !(selectedItem?.claimStatus === "Reviewing Claim" || selectedItem?.claimStatus === "Claim Rejected")
  }
>
  Approve
</Button>

<Button
  danger
  onClick={handleDeny}
  disabled={
    !(selectedItem?.claimStatus === "Reviewing Claim" || selectedItem?.claimStatus === "Claim Approved")
  }
>
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
