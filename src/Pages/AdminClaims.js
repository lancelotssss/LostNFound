import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Select, Typography, Tag, Row, Col } from "antd";
import { jwtDecode } from "jwt-decode";
import { getClaimReport, getClaimDetails, approveClaim, completeTransaction, deleteClaims} from "../api";
import "./styles/ant-input.css";
const { Column } = Table;
const { Option } = Select;
const { Text } = Typography;

export const AdminClaims = () => {

  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [details, setDetails] = useState({ claim: null, foundItem: null, lostItem: null });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [completeModal, setCompleteModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clearClaimsModalVisible, setClearClaimsModalVisible] = useState(false);

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
  const handleComplete = () => setCompleteModal(true);

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

   const handleDeleteAll = async () => {
      if (!window.confirm("Are you sure you want to delete all deleted items?")) return;
      const token = sessionStorage.getItem("User");
      const result = await deleteClaims(token);
      if (result.success) {
        message.success("All deleted items deleted!");
        fetchData();
      } else {
        message.error(result.message);
      }
    };

  const confirmComplete = async () => {
    setCompleteLoading(true);
    const token = sessionStorage.getItem("User");

    try {
      await completeTransaction(token, selectedItem._id, "Completed", user?.studentId);
      message.success("Transaction completed successfully!");
      setCompleteModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error("Error completing transaction:", err);
      message.error("Failed to complete transaction.");
    }

    setCompleteLoading(false);
  };

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    const matchSearch =
      item.cid?.toLowerCase().includes(search) || item.claimerId?.toLowerCase().includes(search);

    const matchStatus = statusFilter ? item.claimStatus === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const STATUS_COLORS = {
    denied: "volcano",
    deleted: "volcano",
    disposed: "volcano",
    pending: "orange",
    "pending claimed": "orange",
    active: "blue",
    claimed: "green",
    listed: "blue",
    reviewing: "orange",
    returned: "green",
    "reviewing claim": "orange",
    "claim rejected": "volcano",
    "claim approved": "blue",
    completed: "green",
  };

  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Button
          onClick={() => {
            const hasDeleted = data.some(item => item.claimStatus === "Deleted");
            if (!hasDeleted) {
              message.info("No deleted items are present!");
              return;
            }
            setClearClaimsModalVisible(true);
          }}
          style={{ marginBottom: 16 }}
        >
          Clear Deleted Claims
        </Button>

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
        <Column title="CLAIM STATUS" dataIndex="claimStatus" key="claimStatus" render={(status) => {
              const color = STATUS_COLORS[status?.toLowerCase()] || "default";
              return (
                <Tag color={color} style={{ fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                  {status ? status.toUpperCase() : "N/A"}
                </Tag>
              );
            }}/>
        <Column title="CREATED AT" dataIndex="createdAt" key="createdAt" />
        <Column title="ADMIN DECISION BY" dataIndex="adminDecisionBy" key="adminDecisionBy" />
      </Table>

<Modal
  title={selectedItem ? "Claim Details" : "Item Details"}
  open={isModalVisible}
  onCancel={handleModalClose}
  width={"92%"}
  maskClosable={false}
  className="modal-claim"
  centered
  wrapClassName="modal-claim-wrap"
  rootClassName="modal-claim-root"
  /** match client: sticky header/footer, scrollable body **/
  styles={{
    header: { position: "sticky", top: 0, zIndex: 2, background: "#fff" },
    body: { padding: 16, maxHeight: "85vh", overflowY: "auto" },
    footer: { position: "sticky", bottom: 0, zIndex: 2, background: "#fff" }
  }}
  footer={
    selectedItem
      ? [
          <Button
            key="complete"
            type="default"
            onClick={handleComplete}
            disabled={selectedItem?.claimStatus !== "Claim Approved"}
            loading={completeLoading}
          >
            Complete
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={handleApprove}
            disabled={
              !(
                selectedItem?.claimStatus === "Reviewing Claim" ||
                selectedItem?.claimStatus === "Claim Rejected"
              )
            }
          >
            Approve
          </Button>,
          <Button
            key="deny"
            danger
            onClick={handleDeny}
            disabled={
              !(
                selectedItem?.claimStatus === "Reviewing Claim" ||
                selectedItem?.claimStatus === "Claim Approved"
              )
            }
          >
            Deny
          </Button>,
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]
      : null
  }
>
  {selectedItem && (
    <div className="claim-details-grid">
      {/* Transaction header */}
      <div className="h1h2container">
        <h1 className="claim-details-grid-h1">CLAIM TRANSACTION NO.</h1>
        <h2 className="claim-details-grid-h2">
          <Text className="claim-details-grid-h2-Text" copyable>
            {details?.claim?.cid || selectedItem?.cid}
          </Text>
        </h2>
      </div>

      {/* Three columns: Found | Lost | Claim */}
      <Row
        gutter={[
          { xs: 12, sm: 16, md: 24, lg: 32, xl: 40 },
          { xs: 12, sm: 16, md: 24, lg: 32, xl: 40 },
        ]}
        className="claim-3col"
        wrap
      >
        {/* Found Item */}
        <Col xs={24} md={8}>
          <div className="claim-card">
            <h3 className="claim-section-h3">Found Item Information</h3>
            <div className="claim-col claim-section">
              <div className="fixed-photo-wrapper">
                <div className="photo-wrap fixed-photo">
                  {details?.foundItem?.photoUrl ? (
                    <Image src={details.foundItem.photoUrl} preview />
                  ) : (
                    <p className="no-image-placeholder">No image submitted</p>
                  )}
                </div>
              </div>

              {details?.foundItem ? (
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  layout="horizontal"
                  className="claim-descriptions"
                >
                  <Descriptions.Item label="TID">
                    {details.foundItem.tid}
                  </Descriptions.Item>
                  <Descriptions.Item label="Title">
                    {details.foundItem.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Category">
                    {details.foundItem.category}
                  </Descriptions.Item>
                  <Descriptions.Item label="Key Item">
                    {details.foundItem.keyItem}
                  </Descriptions.Item>
                  <Descriptions.Item label="Item Brand">
                    {details.foundItem.itemBrand}
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {details.foundItem.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {details.foundItem.status}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date Found">
                    {details.foundItem?.dateFound
                      ? new Date(details.foundItem.dateFound).toLocaleDateString(
                          "en-US",
                          { month: "2-digit", day: "2-digit", year: "numeric" }
                        )
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reported By">
                    {details.foundItem.reportedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved By">
                    {details.foundItem.approvedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date Reported">
                    {details.foundItem.dateReported
                      ? new Date(details.foundItem.dateReported)
                          .toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", "")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {details.foundItem.description}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <p className="muted">No found item data.</p>
              )}
            </div>
          </div>
        </Col>

        {/* Lost Item */}
        <Col xs={24} md={8}>
          <div className="claim-card">
            <h3 className="claim-section-h3">Lost Item Reference</h3>
            <div className="claim-col claim-section">
              <div className="fixed-photo-wrapper">
                <div className="photo-wrap fixed-photo">
                  {details?.lostItem?.photoUrl ? (
                    <Image src={details.lostItem.photoUrl} preview />
                  ) : (
                    <p className="no-image-placeholder">No image submitted</p>
                  )}
                </div>
              </div>

              {details?.lostItem ? (
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  layout="horizontal"
                  className="claim-descriptions"
                >
                  <Descriptions.Item label="TID">
                    {details.lostItem.tid}
                  </Descriptions.Item>
                  <Descriptions.Item label="Title">
                    {details.lostItem.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Category">
                    {details.lostItem.category}
                  </Descriptions.Item>
                  <Descriptions.Item label="Key Item">
                    {details.lostItem.keyItem}
                  </Descriptions.Item>
                  <Descriptions.Item label="Item Brand">
                    {details.lostItem.itemBrand}
                  </Descriptions.Item>
                  <Descriptions.Item label="Location">
                    {details.lostItem.location}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {details.lostItem.status}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date Range">
                    {details.lostItem.startDate && details.lostItem.endDate
                      ? `${new Date(details.lostItem.startDate).toLocaleDateString(
                          "en-US",
                          { month: "2-digit", day: "2-digit", year: "numeric" }
                        )} - ${new Date(details.lostItem.endDate).toLocaleDateString(
                          "en-US",
                          { month: "2-digit", day: "2-digit", year: "numeric" }
                        )}`
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reported By">
                    {details.lostItem.reportedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Approved By">
                    {details.lostItem.approvedBy}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date Reported">
                    {details.lostItem.dateReported
                      ? new Date(details.lostItem.dateReported)
                          .toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", "")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Description">
                    {details.lostItem.description}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <p className="muted">No linked lost item found.</p>
              )}
            </div>
          </div>
        </Col>

        {/* Claim Info */}
        <Col xs={24} md={8}>
          <div className="claim-card">
            <h3 className="claim-section-h3">Claim Information</h3>
            <div className="claim-col claim-section">
              <div className="fixed-photo-wrapper">
                <div className="photo-wrap fixed-photo">
                  {details?.claim?.photoUrl ? (
                    <Image src={details.claim.photoUrl} preview />
                  ) : (
                    <p className="no-image-placeholder">No image submitted</p>
                  )}
                </div>
              </div>

              {details?.claim ? (
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  layout="horizontal"
                  className="claim-descriptions"
                >
                  <Descriptions.Item label="Claim ID">
                    {details.claim.cid}
                  </Descriptions.Item>
                  <Descriptions.Item label="Claimer ID">
                    {details.claim.claimerId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Claim Status">
                    {details.claim.claimStatus}
                  </Descriptions.Item>
                  <Descriptions.Item label="Admin Decision By">
                    {details.claim.adminDecisionBy || "No actions yet."}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date Reported">
                    {details.claim.createdAt
                      ? new Date(details.claim.createdAt)
                          .toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", "")
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Reason">
                    {details.claim.reason}
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <p className="muted">No claim record found.</p>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )}
</Modal>


      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
      >
        <p>Are you sure you want to approve this claim?</p>
      </Modal>

      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to deny this claim?</p>
      </Modal>

      <Modal
        title="Confirm Completion"
        open={completeModal}
        onOk={confirmComplete}
        confirmLoading={completeLoading}
        onCancel={() => setCompleteModal(false)}
      >
        <p>Are you sure you want to mark this claim as completed?</p>
      </Modal>

      <Modal
        title="Confirm Clear Deleted Claims"
        open={clearClaimsModalVisible}
        onCancel={() => setClearClaimsModalVisible(false)}
        centered
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={() => setClearClaimsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={confirmLoading}
            onClick={async () => {
              setConfirmLoading(true);
              const token = sessionStorage.getItem("User");

              try {
                const result = await deleteClaims(token);
                setConfirmLoading(false);
                setClearClaimsModalVisible(false);

                if (result.success) {
                  message.success(result.message);
                  fetchData();
                } else {
                  message.error(result.message || "Failed to delete claims");
                }
              } catch (err) {
                console.error(err);
                message.error("An error occurred while deleting claims");
                setConfirmLoading(false);
                setClearClaimsModalVisible(false);
              }
            }}
          >
            Yes, Clear All
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete all deleted claims? This action cannot be undone.</p>
      </Modal>
    </>
  );
};
