import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Descriptions,
  Image,
  message,
  Input,
  Select,
  Typography,
  Tag,
  Segmented,
} from "antd";
import { getHistory, deleteHistory, deleteClaims } from "../api";
import { jwtDecode } from "jwt-decode";
import "./styles/ant-input.css";
import "./styles/AdminHistory.css";
import { ReloadOutlined, SyncOutlined, DeleteOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Column } = Table;
const { Option } = Select;
const { Text } = Typography;

export const AdminHistory = () => {
  const [view, setView] = useState("Reports"); 
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [data, setData] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("");
  const [clearHistoryModalVisible, setClearHistoryModalVisible] = useState(false);

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

      const res = await getHistory(token);
      if (res && res.success) {
        const formattedReports = (res.reports || [])
          .map((item, index) => ({
            key: item._id ? item._id.toString() : `r-${index}`,
            _id: item._id ? item._id.toString() : null,
            ...item,
            dateReported: item.dateReported
              ? new Date(item.dateReported).toLocaleString()
              : "N/A",
            dateFound: item.dateFound
              ? new Date(item.dateFound).toLocaleDateString()
              : "N/A",
            approvedBy: item.approvedBy || "No actions yet",
          }));

        const formattedClaims = (res.claims || [])
          .map((item, index) => ({
            key: item._id ? item._id.toString() : `c-${index}`,
            _id: item._id ? item._id.toString() : null,
            ...item,
            createdAt: item.createdAt
              ? new Date(item.createdAt).toLocaleString()
              : "No actions yet",
            reviewedAt: item.reviewedAt
              ? new Date(item.reviewedAt).toLocaleString()
              : "No actions yet",
          }));

        setReports(formattedReports);
        setClaims(formattedClaims);
        setData(view === "Reports" ? formattedReports : formattedClaims);
      }
      
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleViewChange = (val) => {
    setView(val);
    setData(val === "Reports" ? reports : claims);
  };

  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleDeleteAll = async () => {
    const token = sessionStorage.getItem("User");
    if (view === "Reports") {
      const result = await deleteHistory(token);
      if (result.success) {
        message.success("All deleted reports removed!");
        fetchData();
      } else {
        message.error(result.message);
      }
    } else {
      const result = await deleteClaims(token);
      if (result.success) {
        message.success("All deleted claims removed!");
        fetchData();
      } else {
        message.error(result.message);
      }
    }
  };

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    if (view === "Reports") {
      const matchesSearch =
        item.tid?.toLowerCase().includes(search) ||
        item.category?.toLowerCase().includes(search) ||
        item.keyItem?.toLowerCase().includes(search) ||
        item.itemBrand?.toLowerCase().includes(search);

      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      const matchesReportType = reportTypeFilter ? item.reportType === reportTypeFilter : true;

      return matchesSearch && matchesStatus && matchesReportType;
    } else {
      const matchesSearch =
        item.cid?.toLowerCase().includes(search) ||
        item.claimerId?.toLowerCase().includes(search);
      const matchesStatus = statusFilter ? item.claimStatus === statusFilter : true;
      return matchesSearch && matchesStatus;
    }
  });

  const STATUS_COLORS = {
    denied: "volcano",
    deleted: "volcano",
    disposed: "volcano",
    pending: "orange",
    active: "blue",
    claimed: "green",
    listed: "blue",
    reviewing: "orange",
    returned: "green",
    completed: "green",
    "reviewing claim": "orange",
    "claim rejected": "volcano",
    "claim approved": "blue",
  };

return (
  <>



    
    <div className="table-controls">





      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- LEFT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <div className="panel panel--filters">
        <div className="panel-title">Search Filters</div>
        <div className="panel-body">
          <Input
            className="poppins-input"
            placeholder={`Search ${view}`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />

          {view === "Reports" && (
            <Select
              placeholder="Filter by Report Type"
              value={reportTypeFilter}
              onChange={(v) => setReportTypeFilter(v)}
              allowClear
            >
              <Option value="">All Reports</Option>
              <Option value="Found">Found</Option>
              <Option value="Lost">Lost</Option>
            </Select>
          )}

          <Select
            placeholder="Filter by Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v)}
            allowClear
          >
            <Option value="">All Status</Option>
            {view === "Reports" ? (
              <>
                <Option value="Reviewing">Reviewing</Option>
                <Option value="Listed">Listed</Option>
                <Option value="Denied">Denied</Option>
                <Option value="Returned">Returned</Option>
                <Option value="Deleted">Deleted</Option>
              </>
            ) : (
              <>
                <Option value="Pending">Pending</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Denied">Denied</Option>
                <Option value="Deleted">Deleted</Option>
              </>
            )}
          </Select>
        </div>
      </div>




      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- RIGHT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <div className="panel panel--actions">
        <div className="panel-title">Actions</div>
        <div className="panel-body panel-actions-row">
          <Segmented
            options={["Reports", "Claims"]}
            value={view}
            onChange={handleViewChange}
          />

      <Button onClick={fetchData} className="btn-with-icons">
        <ReloadOutlined />
        <span>Refresh</span>
      </Button>

      <Button
        className="btn-with-icons btn-danger-outline"
        onClick={() => {
          const hasDeleted = data.some(
            (item) =>
              (view === "Reports" && item.status === "Deleted") ||
              (view === "Claims" && item.claimStatus === "Deleted")
          );
          if (!hasDeleted) {
            message.info(`No deleted ${view.toLowerCase()} found.`);
            return;
          }
          setClearHistoryModalVisible(true);
        }}
      >
        <CloseCircleOutlined />
        <span>Clear Deleted {view}</span>
      </Button>

        </div>
      </div>
    </div>



    {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- TABLE =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
    <Table
      dataSource={filteredData}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: "pointer" },
      })}
    >
      {view === "Reports" ? (
        <>
          <Column title="TITLE" dataIndex="title" key="title" />
          <Column title="REPORT TYPE" dataIndex="reportType" key="reportType" />
          <Column
            title="STATUS"
            dataIndex="status"
            key="status"
            render={(status) => {
              const color = STATUS_COLORS[status?.toLowerCase()] || "default";
              return (
                <Tag
                  color={color}
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                  {status?.toUpperCase() || "N/A"}
                </Tag>
              );
            }}
          />
          <Column title="DATE REPORTED" dataIndex="dateReported" key="dateReported" />
          <Column title="APPROVED BY" dataIndex="approvedBy" key="approvedBy" />
        </>
      ) : (
        <>
          <Column title="CID" dataIndex="cid" key="cid" />
          <Column title="CLAIMER ID" dataIndex="claimerId" key="claimerId" />
          <Column
            title="CLAIM STATUS"
            dataIndex="claimStatus"
            key="claimStatus"
            render={(status) => {
              const color = STATUS_COLORS[status?.toLowerCase()] || "default";
              return (
                <Tag
                  color={color}
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                >
                  {status?.toUpperCase() || "N/A"}
                </Tag>
              );
            }}
          />
          <Column title="CREATED AT" dataIndex="createdAt" key="createdAt" />
          <Column title="REVIEWED AT" dataIndex="reviewedAt" key="reviewedAt" />
        </>
      )}
    </Table>
















    {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- MGA MODALS =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
    <Modal
      title={view === "Reports" ? "Report Details" : "Claim Details"}
      open={isModalVisible}
      onCancel={handleModalClose}
      maskClosable={false}
      centered
      width={800}
      styles={{
        header: { position: "sticky", top: 0, zIndex: 2, background: "#fff" },
        body: { padding: 16, maxHeight: "85vh", overflowY: "auto" },
        footer: { position: "sticky", bottom: 0, zIndex: 2, background: "#fff" },
      }}
      footer={[
        <Button key="ok" onClick={handleModalClose}>
          OK
        </Button>,
      ]}
    >
      {selectedItem && (
        <>
          <div
            className="photo-wrap fixed-photo"
            style={{ maxWidth: 180, height: 200, margin: "8px auto 16px" }}
          >
            {selectedItem.photoUrl ? (
              <Image
                src={selectedItem.photoUrl}
                alt="Item"
                preview
                style={{ objectFit: "contain", maxHeight: "100%" }}
              />
            ) : (
              <p className="no-image-placeholder" style={{ color: "#999", textAlign: "center" }}>
                No image submitted
              </p>
            )}
          </div>

          {view === "Reports" ? (
            <Descriptions bordered column={1} size="small" layout="horizontal">
              <Descriptions.Item label="TID">
                <Text copyable>{selectedItem.tid}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>
          ) : (
            <Descriptions bordered column={1} size="small" layout="horizontal">
              <Descriptions.Item label="CID">
                <Text copyable>{selectedItem.cid}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Claimer ID">{selectedItem.claimerId}</Descriptions.Item>
              <Descriptions.Item label="Claim Status">{selectedItem.claimStatus}</Descriptions.Item>
              <Descriptions.Item label="Created At">{selectedItem.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Reviewed At">{selectedItem.reviewedAt}</Descriptions.Item>
              <Descriptions.Item label="Reason">{selectedItem.reason}</Descriptions.Item>
            </Descriptions>
          )}
        </>
      )}
    </Modal>




    {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- CLEAR MODAL =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
    <Modal
      title={`Confirm Clear ${view}`}
      open={clearHistoryModalVisible}
      onCancel={() => setClearHistoryModalVisible(false)}
      centered
      maskClosable={false}
      footer={[
        <Button key="cancel" onClick={() => setClearHistoryModalVisible(false)}>
          Cancel
        </Button>,
        <Button
          key="confirm"
          type="primary"
          loading={confirmLoading}
          onClick={async () => {
            setConfirmLoading(true);
            await handleDeleteAll();
            setConfirmLoading(false);
            setClearHistoryModalVisible(false);
          }}
        >
          Yes, Clear All
        </Button>,
      ]}
    >





      <p>
        Are you sure you want to delete all deleted {view.toLowerCase()}? This action cannot be
        undone.
      </p>
    </Modal>





  </>
);


};
