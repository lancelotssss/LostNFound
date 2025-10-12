import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Select, Typography } from "antd";
import { jwtDecode } from "jwt-decode";
import { getClaimReport, getClaimDetails, approveClaim, completeTransaction } from "../api";
import "./styles/ant-input.css";
const { Column } = Table;
const { Option } = Select;
const { Text } = Typography;

export const AdminClaims = () => {

    //-----------------------------------DO NOT DELETE-------------------------------

  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState({ claim: null, foundItem: null, lostItem: null });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  
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

    //-----------------------------------DO NOT DELETE-------------------------------

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
  //-----------------------------------DO NOT DELETE-------------------------------

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


  //-----------------------------------DO NOT DELETE-------------------------------

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

 // ✅ Filtering Logic
  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    const matchSearch =
      item.cid?.toLowerCase().includes(search) || item.claimerId?.toLowerCase().includes(search);

    const matchStatus = statusFilter ? item.claimStatus === statusFilter : true;
    return matchSearch && matchStatus;
  });

  //-----------------------------------DO NOT DELETE-------------------------------

  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
       {/* 🔍 Filters (Search + Status Select) */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Input
          className="poppins-input"
          placeholder="Search by Claim ID or Claimer ID"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />

        <Select
          placeholder="Filter by Claim Status"
          value={statusFilter}
          onChange={(value) => setStatusFilter(value)}
          style={{ width: 220 }}
          allowClear
        >
          <Option value="">All Status</Option>
          <Option value="Reviewing Claim">Reviewing Claim</Option>
          <Option value="Claim Approved">Claim Approved</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Claim Rejected">Claim Rejected</Option>
          <Option value="Claim Deleted">Claim Deleted</Option>
        </Select>
      </div>
      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="CLAIM ID" dataIndex="cid" key="cid" />
        <Column title="CLAIMER ID" dataIndex="claimerId" key="claimerId" />
        <Column title="CLAIM STATUS" dataIndex="claimStatus" key="claimStatus" />
        <Column title="CREATED AT" dataIndex="createdAt" key="createdAt" />
        <Column title="ADMIN DECISION BY" dataIndex="adminDecisionBy" key="adminDecisionBy" />
      </Table>

      {/* Details Modal */}
      <Modal
        title={selectedItem ? "Claim Details" : "Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1300}
        maskClosable={false}
        styles={{ maxHeight: "70vh", overflowY: "auto" }}
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
                  <Descriptions.Item label="TID">
                   <Text copyable style={{fontFamily:"Poppins"}}> {details.foundItem.tid} </Text>
                    </Descriptions.Item>
                  <Descriptions.Item label="Title">{details.foundItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{details.foundItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Key Item">{details.foundItem.keyItem}</Descriptions.Item>
                  <Descriptions.Item label="Item Brand">{details.foundItem.itemBrand}</Descriptions.Item>
                  <Descriptions.Item label="Location">{details.foundItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Status">{details.foundItem.status}</Descriptions.Item>
                  <Descriptions.Item label="Date Found">{new Date(details.foundItem.dateFound).toLocaleDateString()}</Descriptions.Item>
                  <Descriptions.Item label="Reported By">{details.foundItem.reportedBy}</Descriptions.Item>
                  <Descriptions.Item label="Approved By">{details.foundItem.approvedBy}</Descriptions.Item>
                  <Descriptions.Item label="Date Reported">
                    {details.foundItem.dateReported
                      ? new Date(details.foundItem.dateReported).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }).replace(",", "")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">{details.foundItem.description}</Descriptions.Item>
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
                  <Descriptions.Item label="TID">
                    <Text copyable style={{fontFamily: "Poppins"}}>{details.lostItem.tid}</Text>
                    </Descriptions.Item>
                  <Descriptions.Item label="Title">{details.lostItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{details.lostItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Key Item">{details.lostItem.keyItem}</Descriptions.Item>
                  <Descriptions.Item label="Item Brand">{details.lostItem.itemBrand}</Descriptions.Item>
                  <Descriptions.Item label="Location">{details.lostItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Status">{details.lostItem.status}</Descriptions.Item>
                  <Descriptions.Item label="Date Range Found">
                    {details.lostItem.startDate || details.lostItem.endDate
                      ? `${details.lostItem.startDate
                          ? new Date(details.lostItem.startDate).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })
                          : "N/A"} - ${
                          details.lostItem.endDate
                            ? new Date(details.lostItem.endDate).toLocaleDateString("en-US", {
                                month: "2-digit",
                                day: "2-digit",
                                year: "numeric",
                              })
                            : "N/A"
                        }`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reported By">{details.lostItem.reportedBy}</Descriptions.Item>
                  <Descriptions.Item label="Approved By">{details.lostItem.approvedBy}</Descriptions.Item>
                  <Descriptions.Item label="Date Reported">
                    {details.lostItem.dateReported
                      ? new Date(details.lostItem.dateReported).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }).replace(",", "")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">{details.lostItem.description}</Descriptions.Item>
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
                    <Descriptions.Item label="Claim ID">
                      <Text copyable style={{fontFamily:"Poppins"}}>{details.claim.cid}</Text>
                      </Descriptions.Item>
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
