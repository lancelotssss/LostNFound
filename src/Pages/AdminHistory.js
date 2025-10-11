import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Select   } from "antd";
import { getHistory, deleteHistory, approveFound } from "../api";
import { jwtDecode } from "jwt-decode";

const { Column } = Table;
const { Option } = Select;

export const AdminHistory = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [reportTypeFilter, setReportTypeFilter] = useState("");
  
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
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
        key: item._id ? item._id.toString() : `row-${index}`,
        _id: item._id ? item._id.toString() : null, 
        ...item,
        dateReported: item.dateReported
          ? new Date(item.dateReported).toLocaleString()
          : "N/A",
        dateFound: item.dateFound
          ? new Date(item.dateFound).toLocaleDateString()
          : "N/A",
          approvedBy: item.approvedBy ? item.approvedBy : "No actions yet"
      }));
      console.log("Formatted Data: ", formattedData)
        setData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching found items:", err);
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

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all deleted items?")) return;
    const token = sessionStorage.getItem("User");
    const result = await deleteHistory(token);
    if (result.success) {
      message.success("All deleted items deleted!");
      fetchData();
    } else {
      message.error(result.message);
    }
  };



  const confirmApprove = async () => {
  setConfirmLoading(true);
  const token = sessionStorage.getItem("User");
  try {
    await approveFound(selectedItem._id, "Active", user.studentId, token);
    message.success("Item approved successfully!");
    setApproveModal(false);
    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error(err);
    message.error("Failed to approve item.");
  } finally {
    setConfirmLoading(false);
  }
};

const confirmDeny = async () => {
  setConfirmLoading(true);
  const token = sessionStorage.getItem("User");
  try {
    await approveFound(selectedItem._id, "Denied", user.studentId, token); // ✅ use _id here
    message.success("Item denied successfully!");
    setDenyModal(false);
    setIsModalVisible(false);
    fetchData();
  } catch (err) {
    console.error(err);
    message.error("Failed to deny item.");
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

  const matchesStatus = statusFilter ? item.status === statusFilter : true;
  const matchesReportType = reportTypeFilter ? item.reportType === reportTypeFilter : true;

  return matchesSearch && matchesStatus && matchesReportType;
});




  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Button onClick={handleDeleteAll} style={{ marginBottom: 16 }}>Clear Deleted Reports</Button>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
  <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
  <Input
    placeholder="Search by TID, Category, or Key Item"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    style={{ width: 300 }}
    allowClear
  />

  <Select
    placeholder="Filter by Report Type"
    value={reportTypeFilter}
    onChange={(value) => setReportTypeFilter(value)}
    style={{ width: 200 }}
    allowClear
  >
    <Option value="">All Report</Option>
    <Option value="Found">Found</Option>
    <Option value="Lost">Lost</Option>
  </Select>

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
  
</div>

      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="TITLE" dataIndex="title" key="title" />
        <Column title="REPORT TYPE" dataIndex="reportType" key="reportType" />
        <Column title="STATUS" dataIndex="status" key="status" />
        <Column title="DATE REPORTED" dataIndex="dateReported" key="dateReported" />
        <Column title="APPROVED BY" dataIndex="approvedBy" key="approvedBy" />
        <Column
          title="UPDATED AT"
          dataIndex="updatedAt"
          key="updatedAt"
          render={(text) => {
            if (!text) return "N/A";
            const date = new Date(text);
            return date
              .toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
              })
              .replace(",", "");
          }}
        />
      </Table>

      {/* Main modal */}
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

        {selectedItem.reportType === "Found" ? (
          
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
            <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
            <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
            <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
            <Descriptions.Item label="Date Found">{selectedItem.dateFound}</Descriptions.Item>
            <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
            <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
            <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
          </Descriptions>
        ) : (
          
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
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
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
          <Button onClick={handleModalClose}>OK</Button>
        </div>
      </>
    )}
      </Modal>

      
    </>
  );
};
