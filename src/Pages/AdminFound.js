import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image } from "antd";
import { getFoundReport } from "../api";

const { Column } = Table;

export const AdminFound = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null); // store row data for modal
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("User"); 
      if (!token) {
        alert("You must be logged in");
        return;
      }

      const res = await getFoundReport(token); 
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          tid: item.tid || "N/A",
          title: item.title || "N/A",
          category: item.category || "N/A",
          keyItem: item.keyItem || "N/A",
          itemBrand: item.itemBrand || "N/A",
          status: item.status || "N/A",
          reportedBy: item.reportedBy || "N/A",
          location: item.location || "N/A",
          dateReported: item.dateReported
            ? new Date(item.dateReported).toLocaleString()
            : "N/A",
          dateFound: item.startDate ? new Date(item.startDate).toLocaleDateString() : "N/A",
          photoUrl: item.photoUrl || null,
          reportType: item.reportType || "N/A",
          description: item.description || "N/A",
        }));

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
        <Column title="TID" dataIndex="tid" key="tid" />
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Start Date" dataIndex="dateFound" key="dateFound" />
      </Table>

      {/* Modal for showing detailed info */}
      <Modal
      title={selectedItem ? selectedItem.title : "Lost Item Details"}
      visible={isModalVisible}
      onCancel={handleModalClose}
      footer={null} // We'll add custom buttons inside modal
      width={700}
      maskClosable={false} // <-- Prevent closing by clicking outside
    >
      {selectedItem && (
        <>
          {/* Image at the top */}
          {selectedItem.photoUrl && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <Image src={selectedItem.photoUrl} width={250} />
            </div>
          )}

          {/* Details below */}
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="TID">{selectedItem.tid}</Descriptions.Item>
            <Descriptions.Item label="Title">{selectedItem.title}</Descriptions.Item>
            <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
            <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
            <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
            <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
            <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
            <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
            <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
            <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
            <Descriptions.Item label="Start Date">{selectedItem.startDate}</Descriptions.Item>
            <Descriptions.Item label="End Date">{selectedItem.endDate}</Descriptions.Item>
            <Descriptions.Item label="Report Type">{selectedItem.reportType}</Descriptions.Item>
            <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
          </Descriptions>

          {/* Approve / Deny Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
            <Button type="primary" >Approve</Button>
            <Button type="primary" >Deny</Button>
            <Button type="primary" >Cancel</Button>
          </div>
        </>
      )}
      </Modal>
    </>
  );
};
