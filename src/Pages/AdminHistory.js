import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input  } from "antd";
import { getHistory, approveFound } from "../api";
import { jwtDecode } from "jwt-decode";

const { Column } = Table;

export const AdminHistory = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");

  
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
  return (
    item.tid?.toLowerCase().includes(search) ||
    item.category?.toLowerCase().includes(search) ||
    item.keyItem?.toLowerCase().includes(search) ||
    item.itemBrand.toLowerCase().includes(search)
  );
});


  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
  <Input
    placeholder="Search by TID, Category, or Key Item"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
    style={{ width: 300 }}
    allowClear
  />
  
</div>

      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Report Type" dataIndex="reportType" key="reportType" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
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
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
              <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
              <Descriptions.Item label="Report Type">{selectedItem.reportType}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Date Found">{selectedItem.dateFound}</Descriptions.Item>
              <Descriptions.Item label="Start Date">{selectedItem.startDate}</Descriptions.Item>
              <Descriptions.Item label="End Date">{selectedItem.endDate}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              <Button onClick={handleModalClose}>OK</Button>
            </div>
          </>
        )}
      </Modal>

      
    </>
  );
};
