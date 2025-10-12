import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Select, Typography } from "antd";
import { getLostReport, approveLost } from "../api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";


import "./styles/ant-input.css";

const { Column } = Table;
const { Option } = Select;
const { Text } = Typography;

export const AdminLost = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  
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
            approvedBy: item.approvedBy ? item.approvedBy : "No actions yet"
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

  const handleRowLostSeeSimilar = () => {
    if (!selectedItem?._id) return;
    // store the Mongo _id in localStorage
    localStorage.setItem("selectedItem", selectedItem._id);

    // keep your existing navigation payload
    navigate("/main/search/result", { state: { selectedItem } });
  };

  const normalizeStatus = (s) =>
    String(s || "").toLowerCase().replace(/[-_]/g, " ").trim();


  const confirmApprove = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await approveLost(selectedItem._id, "Listed", user.studentId, token);
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
        style={{ width: 300 }}
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
          <Option value="Denied">Denied</Option>
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
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column
          title="DATE RANGE"
          key="dateRange"
          render={(_, record) => {
            const { startDate, endDate } = record;

            if (!startDate && !endDate) return "N/A";

            const formatDate = (date) =>
              new Date(date).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              });

            const formattedStart = startDate ? formatDate(startDate) : "N/A";
            const formattedEnd = endDate ? formatDate(endDate) : "N/A";

            return `${formattedStart} - ${formattedEnd}`;
          }}
        />
      </Table>

      
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
                <Text copyable style={{fontFamily: "Poppins"}}>{selectedItem.tid}</Text>
                </Descriptions.Item>
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Date Range">
              {selectedItem.startDate || selectedItem.endDate
                ? `${selectedItem.startDate
                    ? new Date(selectedItem.startDate).toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      })
                    : "N/A"} - ${
                    selectedItem.endDate
                      ? new Date(selectedItem.endDate).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"
                  }`
                : "N/A"}
            </Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button type="primary" onClick={handleApprove}   disabled={!(selectedItem.status === "Reviewing" || selectedItem.status === "Denied")}>
                Approve
              </Button>
              <Button key="find" onClick={handleRowLostSeeSimilar} disabled={normalizeStatus(selectedItem?.status) !== "listed"}>
                See similar items
              </Button>
              <Button danger onClick={handleDeny}  disabled={!(selectedItem.status === "Listed" || selectedItem.status === "Reviewing")}>
                Deny
              </Button>
              <Button onClick={handleModalClose}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>

      
      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
      >
        <p>Are you sure you want to approve this lost report?</p>
      </Modal>

      

      
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
