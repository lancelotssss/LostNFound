// src/Pages/Home.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Descriptions,
  Image,
  message,
  Tag,
  Row,
  Col,
  Card,
  Statistic,
} from "antd";
import {
  SearchOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { getAllReport, getClaimDetailsClient } from "../api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles/Home.css";

const { Column } = Table;

export const Home = () => {
  // DATA
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [claims, setClaims] = useState([]);

  // USER / LOADING
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOST/FOUND item selection + modals
  const [selectedLost, setSelectedLost] = useState(null);
  const [selectedFound, setSelectedFound] = useState(null);
  const [isLostModalVisible, setIsLostModalVisible] = useState(false);
  const [isFoundModalVisible, setIsFoundModalVisible] = useState(false);

  // GENERIC selection you were using for navigation/Dispose helpers
  const [selectedItem, setSelectedItem] = useState(null);

  // CLAIM selection + modal + details
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);
  const [claimDetails, setClaimDetails] = useState(null);

  // SORT ORDERS (friend’s logic)
  const foundStatusOrder = [
    "Listed",
    "Reviewing",
    "Returned",
    "Reviewing Claim",
    "Denied",
    "Deleted",
  ];
  const lostStatusOrder = [
    "Listed",
    "Reviewing",
    "Returned",
    "Reviewing Claim",
    "Denied",
    "Claim Rejected",
    "Deleted",
  ];

  const navigate = useNavigate();
  const token = sessionStorage.getItem("User");

  // STATUS → COLOR
  const STATUS_COLORS = {
    denied: "volcano",
    deleted: "volcano",
    pending: "orange",
    "pending claimed": "orange",
    active: "blue",
    claimed: "green",
    listed: "blue",
    reviewing: "orange",
    returned: "green",
    "reviewing claim": "orange",
    "claim rejected": "volcano",
  };
  const normalizeStatus = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[-_]/g, " ")
      .trim();
  const StatusTag = ({ status }) => {
    const key = normalizeStatus(status);
    const color = STATUS_COLORS[key] || "default";
    return <Tag color={color}>{String(status || "—").toUpperCase()}</Tag>;
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "N/A");

  useEffect(() => {
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setUser(decoded);
    } catch (_) {
      // ignore decode failure
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchData(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

const fetchData = async (tkn) => {
  try {
    setLoading(true);

    // Only fetch reports (lost, found, and claimReports come from here)
    const reportRes = await getAllReport(tkn);

    if (reportRes && reportRes.success) {
      // ---- CLAIMS (from reportRes.claimReports) ----
      const claimFormatted = (reportRes.claimReports || [])
        .map((item, index) => {
          const cid =
            item.cid ||
            item.claimId ||
            item.claim?.cid ||
            item._id ||
            `claim-${index}`;
          const claimerId =
            item.claimerId ||
            item.claimer?.id ||
            item.userId ||
            item.user?.id ||
            item.user ||
            "N/A";
          const claimStatus =
            item.claimStatus || item.status || item.claim?.status || "N/A";

          const createdRaw =
            item.createdAt || item.created_at || item.dateCreated || item.created;

          return {
            key: item._id || `claim-${index}`,
            ...item,
            // normalized fields for the table
            cid,
            claimerId,
            claimStatus,
            createdAtRaw: createdRaw ? new Date(createdRaw).toISOString() : null, // for sorting
            createdAt: formatDate(createdRaw), // for display
          };
        })
        .sort((a, b) => {
          const A = a.createdAtRaw ? Date.parse(a.createdAtRaw) : 0;
          const B = b.createdAtRaw ? Date.parse(b.createdAtRaw) : 0;
          return B - A; // newest first
        });

      // ---- LOST ----
      const lostFormatted = (reportRes.lostReports || [])
        .map((item, index) => ({
          key: item._id || `lost-${index}`,
          ...item,
          dateReported: formatDate(item.dateReported),
          dateFound: formatDate(item.dateFound),
        }))
        .sort(
          (a, b) =>
            lostStatusOrder.indexOf(a.status) - lostStatusOrder.indexOf(b.status)
        );

      // ---- FOUND ----
      const foundFormatted = (reportRes.foundReports || [])
        .map((item, index) => ({
          key: item._id || `found-${index}`,
          ...item,
          dateReported: formatDate(item.dateReported),
          dateFound: formatDate(item.dateFound),
        }))
        .sort(
          (a, b) =>
            foundStatusOrder.indexOf(a.status) - foundStatusOrder.indexOf(b.status)
        );

      setLost(lostFormatted);
      setFound(foundFormatted);
      setClaims(claimFormatted);

      // Optional sanity check
      // console.log("claimReports:", reportRes.claimReports?.length, claimFormatted);
    } else {
      message.error("Failed to load lost/found reports.");
      setLost([]);
      setFound([]);
      setClaims([]);
    }

    // IMPORTANT: remove the old claimRes branch entirely.
    // It was overwriting claims with [] because claimRes was undefined.
  } catch (err) {
    console.error("Error fetching data:", err);
    message.error("Failed to load data.");
  } finally {
    setLoading(false);
  }
};

  // Pagination (keep your UX copy)
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) =>
      `Showing ${range[1] - range[0] + 1} of ${total} records`,
  };

  // LOST handlers
  const handleLostClick = (record) => {
    setSelectedLost(record);
    setSelectedItem(record); // keep your selectedItem for shared actions
    setIsLostModalVisible(true);
  };
  const handleLostModalClose = () => {
    setIsLostModalVisible(false);
    setSelectedLost(null);
    setSelectedItem(null);
  };

  // FOUND handlers
  const handleFoundClick = (record) => {
    setSelectedFound(record);
    setSelectedItem(record);
    setIsFoundModalVisible(true);
  };
  const handleFoundModalClose = () => {
    setIsFoundModalVisible(false);
    setSelectedFound(null);
    setSelectedItem(null);
  };

  // Navigate to similar for LOST (preserve your classnames/route)
  const handleRowLostSeeSimilar = () => {
    if (!selectedLost?._id) return;
    // store the Mongo _id in localStorage
    localStorage.setItem("selectedLostId", selectedLost._id);

    // keep your existing navigation payload
    navigate("/cli/search/result", { state: { selectedItem: selectedLost } });
    handleLostModalClose();
  };
  // Dispose (friend’s “soft delete” update + your endpoint)
  const handleDispose = async (id, type) => {
    const confirm = window.confirm(
      "Are you sure you want to dispose this report?"
    );
    if (!confirm) return;

    try {
      const response = await axios.put(
        `http://localhost:3110/home/${id}/dispose`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response?.data?.success) {
        message.success(response.data.message);

        const t = String(type || "").toLowerCase();
        if (t === "lost") {
          setLost((prev) =>
            prev.map((r) => (r._id === id ? { ...r, status: "Deleted" } : r))
          );
          if (selectedLost?._id === id) handleLostModalClose();
        } else if (t === "found") {
          setFound((prev) =>
            prev.map((r) => (r._id === id ? { ...r, status: "Deleted" } : r))
          );
          if (selectedFound?._id === id) handleFoundModalClose();
        }
      } else {
        message.error("Failed to dispose report");
      }
    } catch (err) {
      console.error("Dispose error:", err);
      message.error("An error occurred while disposing the report.");
    }
  };

  // CLAIM handlers
  const handleClaimRowClick = async (record) => {
    try {
      setSelectedClaim(record);
      setIsClaimModalVisible(true);
      localStorage.setItem("selectedClaimId", record._id);

      const claimData = await getClaimDetailsClient(token, record._id);

      if (claimData && claimData.success) {
        setClaimDetails({
          claim: claimData.claim || null,
          lostItem: claimData.lostItem || null,
          foundItem: claimData.foundItem || null,
        });
      } else {
        setClaimDetails(null);
        message.warning("No claim details found for this item.");
      }
    } catch (err) {
      console.error("Error fetching claim details:", err);
      setClaimDetails(null);
      message.error("Failed to load claim details.");
    }
  };
  const handleClaimModalClose = () => {
    setIsClaimModalVisible(false);
    setSelectedClaim(null);
    setClaimDetails(null);
  };

  return (
    <div className="main-container">
      {/* HEADER */}
      <div className="home-header">
        <p className="home-header__welcome">
          GOOD DAY, {user ? user.name : "Guest"}!
        </p>
      </div>

      {/* OVERVIEW CARDS (yours) */}
      <div className="overview">
        <h3 className="overview__title">OVERVIEW</h3>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Card className="overview__card">
              <Statistic
                title="TOTAL LOST ITEM REPORTED"
                value={lost.length}
                prefix={<SearchOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="overview__card">
              <Statistic
                title="TOTAL FOUND ITEM REPORTED"
                value={found.length}
                prefix={<FolderOpenOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="overview__card">
              <Statistic
                title="TOTAL ITEMS CLAIMED"
                value={claims.length}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* LOST TABLE */}
      <h3 className="section-title section-title--mt8">MY LOST REPORTS</h3>
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={lost}
          rowClassName={() => "clickable-row"}
          onRow={(record) => ({
            onClick: () => handleLostClick(record),
          })}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
        >
          <Column title="LOST ITEMS" dataIndex="title" key="title" />
          <Column title="ITEM NAME" dataIndex="keyItem" key="keyItem" />
          <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(status) => <StatusTag status={status} />}
          />
          <Column
            title="Date Reported"
            dataIndex="dateReported"
            key="dateReported"
          />
          <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
        </Table>
      </div>

      {/* FOUND TABLE */}
      <h3 className="section-title section-title--mt24">MY FOUND REPORTS</h3>
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={found}
          rowClassName={() => "clickable-row"}
          onRow={(record) => ({
            onClick: () => handleFoundClick(record),
          })}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
        >
          <Column title="FOUND ITEMS" dataIndex="title" key="title" />
          <Column title="ITEM NAME" dataIndex="keyItem" key="keyItem" />
          <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
          <Column
            title="Status"
            dataIndex="status"
            key="status"
            render={(status) => <StatusTag status={status} />}
          />
          <Column
            title="Date Reported"
            dataIndex="dateReported"
            key="dateReported"
          />
          <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
        </Table>
      </div>

      {/* CLAIM TABLE */}
      <h3 className="section-title section-title--mt24">CLAIM TRANSACTIONS</h3>
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={claims}
          rowClassName={() => "clickable-row"}
          onRow={(record) => ({
            onClick: () => handleClaimRowClick(record),
          })}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
        >
          <Column title="Claim ID" dataIndex="cid" key="cid" />
          <Column title="Claimer ID" dataIndex="claimerId" key="claimerId" />
          <Column title="Claim Status" dataIndex="claimStatus" key="claimStatus" />
          <Column title="Created At" dataIndex="createdAt" key="createdAt" />
        </Table>
      </div>

      {/* LOST MODAL */}
      <Modal
        title={selectedLost ? selectedLost.title : "Lost Item Details"}
        open={isLostModalVisible}
        onCancel={handleLostModalClose}
        footer={[
          <Button key="close" onClick={handleLostModalClose}>
            Close
          </Button>,
          <Button
            key="find"
            onClick={handleRowLostSeeSimilar}
            disabled={normalizeStatus(selectedLost?.status) !== "listed"}
          >
            See similar items
          </Button>,
          <Button
            key="dispose"
            danger
            onClick={() =>
              selectedLost?._id && handleDispose(selectedLost._id, "lost")
            }
            disabled={
              !["Listed", "Reviewing"].includes(selectedLost?.status || "")
            }
          >
            Delete
          </Button>,
        ]}
        width={700}
        maskClosable={false}
      >
        {selectedLost && (
          <>
            {selectedLost.photoUrl && (
              <div className="photo-wrap">
                <Image src={selectedLost.photoUrl} width={250} />
              </div>
            )}
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">
                {selectedLost.tid}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedLost.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedLost.category}
              </Descriptions.Item>
              <Descriptions.Item label="Key Item">
                {selectedLost.keyItem}
              </Descriptions.Item>
              <Descriptions.Item label="Item Brand">
                {selectedLost.itemBrand}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedLost.status}
              </Descriptions.Item>
              <Descriptions.Item label="Reported By">
                {selectedLost.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Approved By">
                {selectedLost.approvedBy
                  ? selectedLost.approvedBy
                  : "No actions yet."}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedLost.location}
              </Descriptions.Item>
              <Descriptions.Item label="Date Reported">
                {selectedLost.dateReported}
              </Descriptions.Item>
              <Descriptions.Item label="Report Type">
                {selectedLost.reportType}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedLost.description}
              </Descriptions.Item>
              <Descriptions.Item label="Date Range Lost">
                {selectedLost.startDate && selectedLost.endDate
                  ? `${new Date(selectedLost.startDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      }
                    )} - ${new Date(selectedLost.endDate).toLocaleDateString(
                      "en-US",
                      {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      }
                    )}`
                  : "No Information Provided"}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* FOUND MODAL */}
      <Modal
        title={selectedFound ? selectedFound.title : "Found Item Details"}
        open={isFoundModalVisible}
        onCancel={handleFoundModalClose}
        footer={[
          <Button key="close" onClick={handleFoundModalClose}>
            Close
          </Button>,
          <Button
            key="dispose"
            danger
            onClick={() =>
              selectedFound?._id && handleDispose(selectedFound._id, "found")
            }
            disabled={
              !["Active", "Pending Verification"].includes(
                selectedFound?.status || ""
              )
            }
          >
            Delete
          </Button>,
        ]}
        width={700}
        maskClosable={false}
      >
        {selectedFound && (
          <>
            {selectedFound.photoUrl && (
              <div className="photo-wrap">
                <Image src={selectedFound.photoUrl} width={250} />
              </div>
            )}
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">
                {selectedFound.tid}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedFound.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedFound.category}
              </Descriptions.Item>
              <Descriptions.Item label="Key Item">
                {selectedFound.keyItem}
              </Descriptions.Item>
              <Descriptions.Item label="Item Brand">
                {selectedFound.itemBrand}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedFound.status}
              </Descriptions.Item>
              <Descriptions.Item label="Reported By">
                {selectedFound.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Approved By">
                {selectedFound.approvedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedFound.location}
              </Descriptions.Item>
              <Descriptions.Item label="Date Reported">
                {selectedFound.dateReported}
              </Descriptions.Item>
              <Descriptions.Item label="Date Found">
                {selectedFound.dateFound}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedFound.description}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* CLAIM DETAILS MODAL */}
{/* CLAIM DETAILS MODAL (stacked sections, fixed image containers) */}
<Modal
  title={selectedClaim ? selectedClaim.title : "Claim Details"}
  open={isClaimModalVisible}
  onCancel={handleClaimModalClose}
  footer={[<Button key="close" onClick={handleClaimModalClose}>Close</Button>]}
  width={1200}
  maskClosable={false}
  className="modal-claim"
  closable={false}
  styles={{ body: { padding: 16 } }}  // AntD v5; safe to remove if not needed
>
  {claimDetails ? (
    <div className="claim-details-grid">
      {/* Found Item */}
      <div className="claim-col claim-section">
        <h3 className="claim-section-h3">Found Item Information</h3>

        {claimDetails?.foundItem?.photoUrl && (
          <div className="fixed-photo-wrapper">
            <div className="photo-wrap fixed-photo">
              <Image
                src={claimDetails.foundItem.photoUrl}
                preview
              />
            </div>
          </div>
        )}

        {claimDetails?.foundItem ? (
          <Descriptions
            bordered
            column={1}
            size="middle"
            className="claim-descriptions"
          >
            <Descriptions.Item label="TID">
              {claimDetails.foundItem.tid}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {claimDetails.foundItem.title}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {claimDetails.foundItem.category}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {claimDetails.foundItem.location}
            </Descriptions.Item>
            <Descriptions.Item label="Date Found">
              {claimDetails.foundItem.dateFound
                ? new Date(claimDetails.foundItem.dateFound).toLocaleDateString(
                    "en-US",
                    { month: "2-digit", day: "2-digit", year: "numeric" }
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {claimDetails.foundItem.status}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {claimDetails.foundItem.description}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="muted">No found item data.</p>
        )}
      </div>

      {/* Lost Item */}
      <div className="claim-col claim-section">
        <h3 className="claim-section-h3">Lost Item Reference</h3>

        {claimDetails?.lostItem?.photoUrl && (
          <div className="fixed-photo-wrapper">
            <div className="photo-wrap fixed-photo">
              <Image
                src={claimDetails.lostItem.photoUrl}
                preview
              />
            </div>
          </div>
        )}

        {claimDetails?.lostItem ? (
          <Descriptions
            bordered
            column={1}
            size="middle"
            className="claim-descriptions"
          >
            <Descriptions.Item label="TID">
              {claimDetails.lostItem.tid}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {claimDetails.lostItem.title}
            </Descriptions.Item>
            <Descriptions.Item label="Category">
              {claimDetails.lostItem.category}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {claimDetails.lostItem.location}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date">
              {claimDetails.lostItem.startDate
                ? new Date(
                    claimDetails.lostItem.startDate
                  ).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="End Date">
              {claimDetails.lostItem.endDate
                ? new Date(
                    claimDetails.lostItem.endDate
                  ).toLocaleDateString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  })
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {claimDetails.lostItem.status}
            </Descriptions.Item>
            <Descriptions.Item label="Description">
              {claimDetails.lostItem.description}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="muted">No linked lost item found.</p>
        )}
      </div>

      {/* Claim Info */}
      <div className="claim-col claim-section">
        <h3 className="claim-section-h3">Claim Information</h3>

        {claimDetails?.claim?.photoUrl && (
          <div className="fixed-photo-wrapper">
            <div className="photo-wrap fixed-photo">
              <Image
                src={claimDetails.claim.photoUrl}
                preview
              />
            </div>
          </div>
        )}

        {claimDetails?.claim ? (
          <Descriptions
            bordered
            column={1}
            size="middle"
            className="claim-descriptions"
          >
            <Descriptions.Item label="Claim ID">
              {claimDetails.claim.cid}
            </Descriptions.Item>
            <Descriptions.Item label="Claimer ID">
              {claimDetails.claim.claimerId}
            </Descriptions.Item>
            <Descriptions.Item label="Claim Status">
              {claimDetails.claim.claimStatus}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Decision By">
              {claimDetails.claim.adminDecisionBy
                ? claimDetails.claim.adminDecisionBy
                : "No actions yet."}
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {claimDetails.claim.createdAt
                ? new Date(claimDetails.claim.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "2-digit", day: "2-digit", year: "numeric" }
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Reason">
              {claimDetails.claim.reason}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="muted">No claim record found for this item.</p>
        )}
      </div>
    </div>
  ) : (
    <p className="muted">No claim details available.</p>
  )}
</Modal>

    </div>
  );
};

export default Home;
