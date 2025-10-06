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
import { getAllReport, getAllClaim } from "../api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "./styles/Home.css";

const { Column } = Table;

export const Home = () => {
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [claims, setClaims] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("User");

  // status → color map
  const STATUS_COLORS = {
    denied: "volcano",
    deleted: "volcano",
    pending: "orange",
    "pending claimed": "orange",
    active: "blue",
    claimed: "green",
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

  useEffect(() => {
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchData(token);
    }
  }, []); // mount only

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "N/A");

  const fetchData = async (tkn) => {
    try {
      setLoading(true);

      // Fetch lost/found and claims (separately; keeps api.js unchanged)
      const [reportRes, claimRes] = await Promise.all([
        getAllReport(tkn),
        getAllClaim(tkn),
      ]);

      // LOST/FOUND
      if (reportRes && reportRes.success) {
        const lostFormatted = (reportRes.lostReports || []).map(
          (item, index) => ({
            key: item._id || `lost-${index}`,
            ...item,
            dateReported: formatDate(item.dateReported),
            dateFound: formatDate(item.dateFound),
          })
        );

        const foundFormatted = (reportRes.foundReports || []).map(
          (item, index) => ({
            key: item._id || `found-${index}`,
            ...item,
            dateReported: formatDate(item.dateReported),
            dateFound: formatDate(item.dateFound),
          })
        );

        setLost(lostFormatted);
        setFound(foundFormatted);
      } else {
        message.error("Failed to load lost/found reports.");
      }

      // CLAIMS (be forgiving about server shape)
      if (
        claimRes &&
        (claimRes.success ||
          Array.isArray(claimRes?.results) ||
          Array.isArray(claimRes?.claims) ||
          Array.isArray(claimRes?.claimReports))
      ) {
        const rawClaims =
          claimRes.claims || claimRes.claimReports || claimRes.results || [];

        const claimsFormatted = rawClaims.map((item, index) => ({
          key: item._id || `claim-${index}`,
          ...item,
          dateReported: formatDate(item.dateReported),
          dateFound: formatDate(item.dateFound),
          dateClaimed: formatDate(item.dateClaimed || item.claimDate),
        }));

        setClaims(claimsFormatted);
      } else {
        setClaims([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // LOST/FOUND modal handlers
  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };
  const handleRowLost = () => {
    if (selectedItem) {
      navigate("/cli/search/result", { state: { selectedItem } });
      handleModalClose();
    }
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  // CLAIMS modal handlers
  const handleClaimRowClick = (record) => {
    setSelectedClaim(record);
    setIsClaimModalVisible(true);
  };
  const handleClaimModalClose = () => {
    setIsClaimModalVisible(false);
    setSelectedClaim(null);
  };

  // Optional custom action you added earlier
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
          setLost((prev) => prev.filter((r) => r._id !== id));
        } else if (t === "found") {
          setFound((prev) => prev.filter((r) => r._id !== id));
        }

        if (selectedItem?._id === id) handleModalClose();
      } else {
        message.error("Failed to dispose report");
      }
    } catch (err) {
      console.error("Dispose error:", err);
      message.error("An error occurred while disposing the report.");
    }
  };

  // shared pagination config: shows “Showing X of Y records”
  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total, range) =>
      `Showing ${range[1] - range[0] + 1} of ${total} records`,
  };

  return (
    <div className="main-container">
      <div className="home-header">
        <p className="home-header__welcome">
          GOOD DAY, {user ? user.name : "Guest"}!
          {console.log(user ? user.name : "tanginamo")}
        </p>
      </div>

      {/* OVERVIEW CARDS */}
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

      {/* LOST */}
      <h3 className="section-title section-title--mt8">MY LOST REPORTS</h3>
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={lost}
          rowClassName={() => "clickable-row"}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
        >
          <Column title="TITLE / LOST ITEMS" dataIndex="title" key="title" />
          <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
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

      {/* FOUND */}
      <h3 className="section-title section-title--mt24">MY FOUND REPORTS</h3>
      <div className="table-responsive">
        <Table
          loading={loading}
          dataSource={found}
          rowClassName={() => "clickable-row"}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          pagination={paginationConfig}
          scroll={{ x: "max-content" }}
        >
          <Column title="Title" dataIndex="title" key="title" />
          <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
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

      {/* CLAIM TRANSACTIONS */}
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
          <Column title="Title" dataIndex="title" key="title" />
          <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
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
          <Column
            title="Date Claimed"
            dataIndex="dateClaimed"
            key="dateClaimed"
          />
        </Table>
      </div>

      {/* LOST/FOUND MODAL */}
      <Modal
        title={selectedItem ? selectedItem.title : "Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          selectedItem?.reportType?.toLowerCase() === "lost" && (
            <Button
              key="find"
              onClick={handleRowLost}
              disabled={selectedItem?.status?.toLowerCase() !== "active"}
            >
              See similar items
            </Button>
          ),
          <Button
            key="dispose"
            danger
            onClick={() => {
              if (!selectedItem?._id) {
                message.error("Missing item id.");
                return;
              }
              handleDispose(selectedItem._id, selectedItem.reportType);
            }}
          >
            Dispose
          </Button>,
        ]}
        width={700}
        maskClosable={false}
      >
        {selectedItem && (
          <>
            {selectedItem.photoUrl && (
              <div className="photo-wrap">
                <Image src={selectedItem.photoUrl} width={250} />
              </div>
            )}

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">
                {selectedItem.tid}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedItem.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedItem.category}
              </Descriptions.Item>
              <Descriptions.Item label="Key Item">
                {selectedItem.keyItem}
              </Descriptions.Item>
              <Descriptions.Item label="Item Brand">
                {selectedItem.itemBrand}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedItem.status}
              </Descriptions.Item>
              <Descriptions.Item label="Reported By">
                {selectedItem.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Approved By">
                {selectedItem.approvedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedItem.location}
              </Descriptions.Item>
              <Descriptions.Item label="Date Reported">
                {selectedItem.dateReported}
              </Descriptions.Item>
              <Descriptions.Item label="Report Type">
                {selectedItem.reportType}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedItem.description}
              </Descriptions.Item>
              <Descriptions.Item label="Date Found">
                {selectedItem.dateFound}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* CLAIM DETAILS MODAL (close-only footer) */}
      <Modal
        title={selectedClaim ? selectedClaim.title : "Claim Details"}
        open={isClaimModalVisible}
        onCancel={handleClaimModalClose}
        footer={[
          <Button key="close" onClick={handleClaimModalClose}>
            Close
          </Button>,
        ]}
        width={700}
        maskClosable={false}
      >
        {selectedClaim && (
          <>
            {selectedClaim.photoUrl && (
              <div className="photo-wrap">
                <Image src={selectedClaim.photoUrl} width={250} />
              </div>
            )}

            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">
                {selectedClaim.tid}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedClaim.title}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {selectedClaim.category}
              </Descriptions.Item>
              <Descriptions.Item label="Key Item">
                {selectedClaim.keyItem}
              </Descriptions.Item>
              <Descriptions.Item label="Item Brand">
                {selectedClaim.itemBrand}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                {selectedClaim.status}
              </Descriptions.Item>
              <Descriptions.Item label="Reported By">
                {selectedClaim.reportedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Approved By">
                {selectedClaim.approvedBy}
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedClaim.location}
              </Descriptions.Item>
              <Descriptions.Item label="Date Reported">
                {selectedClaim.dateReported}
              </Descriptions.Item>
              <Descriptions.Item label="Report Type">
                {selectedClaim.reportType}
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {selectedClaim.description}
              </Descriptions.Item>
              <Descriptions.Item label="Date Found">
                {selectedClaim.dateFound}
              </Descriptions.Item>
              {selectedClaim.dateClaimed && (
                <Descriptions.Item label="Date Claimed">
                  {selectedClaim.dateClaimed}
                </Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Home;
