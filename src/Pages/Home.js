
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getAllReport, deleteReport} from "../api";

import {
  Table,
  Modal,
  Descriptions,
  Typography,
  Row,
  Col,
  Card,
  Statistic,
  Tag,
  Spin,
  Image,
  message
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
const { Title, Text } = Typography;

export function Profile() {
  const [rows, setRows] = useState([]);
  const [user, setUser] = useState({});
  const [foundCounts, setFoundCounts] = useState(0);
  const [lostCounts, setLostCounts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const token = sessionStorage.getItem("User");

 
  const handleRowLost = (record) => {
    if (selectedItem) {
      navigate("/cli/search/result", {
        state: { selectedItem },
      });
      setIsModalVisible(false);
    }
  };
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  const openModal = (record) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };
  const closeModal = () => {
    setDetailOpen(false);
    setDetailRecord(null);
  };
  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };
 const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };
  const handleDelete = async (id) => {
 
    const confirm = window.confirm("Are you sure you want to delete this report?");
    if (!confirm) return;
 
    try {
    const response = await deleteReport(id, token);
    if (response.success) {
      message.success("Report deleted successfully");
      await fetchData(token);
    } else {
      message.error("Failed to delete report");
    }
  } catch (error) {
    console.error("Delete error:", error);
    message.error("An error occurred while deleting the report.");
  }
};
  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      const allReports = await getAllReport(token);

      const formatted = (allReports.results || []).map((item, index) => ({
        
        key: item._id ? String(item._id) : `row-${index}`,
        
        tid: item.tid || "N/A",
        category: item.category || "N/A",
        photoUrl: item.photoUrl || "N/A",
        dateFound: item.dateFound || "N/A",
        description: item.description || "N/A",
        reportedBy: item.reportedBy || "N/A",
        approvedBy: item.approvedBy || "N/A",
        title: item.title || "N/A",
        keyItem: item.keyItem || "N/A",
        itemBrand: item.itemBrand || "N/A",
        location: item.location || "N/A",
        dateReported: item.dateReported || "N/A",
        reportType: (item.reportType || "N/A").toLowerCase(),
        status: (item.status || "N/A").toLowerCase(),
        _raw: item, 
      }));

      setFoundCounts(allReports.countFound?.length || 0);
      setLostCounts(allReports.countLost?.length || 0);
      setRows(formatted);
      setLoading(false);
    }

    loadUserData();
  }, []);

  const reportColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Key Item", dataIndex: "keyItem", key: "keyItem" },
    { title: "Brand", dataIndex: "itemBrand", key: "itemBrand" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Date Reported", dataIndex: "dateReported", key: "dateReported" },
    {
      title: "Type",
      dataIndex: "reportType",
      key: "reportType",
      render: (v) => (v ? v.toUpperCase() : "—"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) =>
        v ? <Tag color={v === "claimed" ? "green" : "default"}>{v.toUpperCase()}</Tag> : "—",
    },
  ];

  
  const clickableRow = (record) => ({
    onClick: () => openModal(record),
    style: { cursor: "pointer" },
  });

  if (loading) {
    return (
      <div style={{ minHeight: 360, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }
 

  return (
    <>
      
      <div style={{ marginBottom: 12 }}>
        <Text strong>Student-ID:</Text> <Text>{user.studentId || "Unknown"}</Text>
        <br />
        <Text strong>Name:</Text> <Text>{user.name}</Text>
        <br />
        <Text strong>Email:</Text> <Text>{user.email || "Unknown"}</Text>
      </div>

      
      <Title level={5} style={{ marginBottom: 12 }}>OVERVIEW</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="TOTAL LOST ITEM REPORTED" value={lostCounts} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="TOTAL MISSING ITEM REPORTED" value={foundCounts} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic title="TOTAL ITEMS CLAIMED" value={rows.filter(r => r.status === "claimed").length} />
          </Card>
        </Col>
      </Row>

      <Title level={5} style={{ marginTop: 8 }}>MY REPORTS</Title>
      <Card>
        <Table
          dataSource={rows}
          columns={reportColumns}
          rowKey="key"
          pagination={{ pageSize: 8, showSizeChanger: true }}
          scroll={{ x: "max-content" }}      
          onRow={clickableRow}                
        />
      </Card>

      
      <Title level={5} style={{ marginTop: 8 }}>MY REPORTS</Title>
      <Card>
        <Table
          dataSource={rows}
          columns={reportColumns}
          rowKey="key"
          pagination={{ pageSize: 8, showSizeChanger: true }}
          scroll={{ x: "max-content" }}      
          onRow={clickableRow}                
        />
      </Card>

      
      <Modal
        open={detailOpen}
        onCancel={closeModal}
        onOk={closeModal}
        title={detailRecord?.title || "Report Details"}
        okText="Close"
        cancelButtonProps={{ style: { display: "none" } }}
        centered
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          selectedItem?.reportType?.toLowerCase() === "lost" && (
          <Button key ="find" onClick = {handleRowLost} disabled={selectedItem?.status?.toLowerCase() !== "active"}>See similar items</Button>),
          <Button key="delete" danger onClick={async () => {await handleDelete(selectedItem._id);handleModalClose();}}>Delete </Button>,
        ]}
      >
        {detailRecord ? (
          <Descriptions bordered column={1} size="small" labelStyle={{ width: 160 }}>
            {detailRecord.photoUrl && detailRecord.photoUrl !== "N/A" && (
              <Descriptions.Item label="Photo">
                <Image
                  src={detailRecord.photoUrl}
                  alt={detailRecord.title || "Item photo"}
                  
                  style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 8 }}
                  fallback="/assets/placeholder.png"   
                />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="tid">{detailRecord.tid}</Descriptions.Item>
            <Descriptions.Item label="Title">{detailRecord.title}</Descriptions.Item>
            <Descriptions.Item label="Category">{detailRecord.category}</Descriptions.Item>
            <Descriptions.Item label="Key Item">{detailRecord.keyItem}</Descriptions.Item>
            <Descriptions.Item label="Item Brand">{detailRecord.itemBrand}</Descriptions.Item>
            <Descriptions.Item label="Status">{detailRecord.status?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="reportedBy">{detailRecord.reportedBy?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="approvedBy">{detailRecord.approvedBy?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Location">{detailRecord.location}</Descriptions.Item>
            <Descriptions.Item label="Date Reported">{detailRecord.dateReported}</Descriptions.Item>
            <Descriptions.Item label="Type">{detailRecord.reportType?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="description">{detailRecord.description?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="dateFound">{detailRecord.dateFound?.toUpperCase()}</Descriptions.Item>
          </Descriptions>
        ) : null}
      </Modal>
    </>
  );
}


export default Profile;
