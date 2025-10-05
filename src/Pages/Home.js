import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Popconfirm } from "antd";
import { getAllReport, deleteReport } from "../api"; 
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Column } = Table;

export const Home = () => {
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  //const [claim, setClaim] = ([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = sessionStorage.getItem("User");


  useEffect(() => {
    if (token) {
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchData(token);
    }
  }, []);


  const fetchData = async (token) => {
  try {
    setLoading(true);
    const res = await getAllReport(token);
    if (res && res.success) {
      const formatDate = (d) =>
        d ? new Date(d).toLocaleString() : "N/A";

      const lostFormatted = (res.lostReports || []).map((item, index) => ({
        key: item._id || `lost-${index}`,
        ...item,
        dateReported: formatDate(item.dateReported),
        dateFound: formatDate(item.dateFound),
      }));

      const foundFormatted = (res.foundReports || []).map((item, index) => ({
        key: item._id || `found-${index}`,
        ...item,
        dateReported: formatDate(item.dateReported),
        dateFound: formatDate(item.dateFound),
      }));

      setLost(lostFormatted);
      setFound(foundFormatted);
    } else {
      message.error("Failed to load reports.");
    }
  } catch (err) {
    console.error("Error fetching reports:", err);
    message.error("Failed to load reports.");
  } finally {
    setLoading(false);
  }
};

  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleRowLost = (record) => {
    if (selectedItem) {
      navigate("/cli/search/result", {
        state: { selectedItem },
      });
      setIsModalVisible(false);
    }
  };

  const handleClaimSuccess = (claimedId) => {
  // Remove claimed item from Found table
  setFound(prev => prev.filter(item => item._id !== claimedId));

  // Optionally remove from Lost table if needed
  setLost(prev => prev.filter(item => item._id !== claimedId));

  // Close modal if the claimed item is currently open
  if (selectedItem?._id === claimedId) {
    handleModalClose();
  }

  message.success("Item claimed successfully!");
};

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  


  const handleDispose = async (id, type) => {
  const confirm = window.confirm("Are you sure you want to dispose this report?");
  if (!confirm) return;

  try {
    const response = await axios.put(`http://localhost:3110/home/${id}/dispose`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.data.success) {
      message.success(response.data.message);

      // Remove disposed report from table
      if (type === "Lost") {
        setLost(prev => prev.filter(report => report._id !== id));
      } else if (type === "Found") {
        setFound(prev => prev.filter(report => report._id !== id));
      }

      // Close modal if the disposed report was selected
      if (selectedItem?._id === id) {
        handleModalClose();
      }
    } else {
      message.error("Failed to dispose report");
    }
  } catch (err) {
    console.error("Dispose error:", err);
    message.error("An error occurred while disposing the report.");
  }
};

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <p>Welcome, {user ? user.name : "Guest"} </p>
        <Button onClick={() => fetchData(sessionStorage.getItem("User"))}>
          Refresh
        </Button>
      </div>

      <h1>MY LOST TABLE</h1>

      <Table
        loading={loading}
        dataSource={lost}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
      </Table>

      <h1>MY FOUND TABLE</h1>

      <Table
        loading={loading}
        dataSource={found}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
      </Table>


      {/* Modal */}
      <Modal
        title={selectedItem ? selectedItem.title : "Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
          selectedItem?.reportType?.toLowerCase() === "lost" && (
          <Button key ="find" onClick = {handleRowLost} disabled={selectedItem?.status?.toLowerCase() !== "active"}>See similar items</Button>),
          <Button key="dispose" danger onClick={() => handleDispose(selectedItem._id, selectedItem.reportType)}>Dispose</Button>,
        ]}
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
              <Descriptions.Item label="Category">{selectedItem.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedItem.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedItem.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedItem.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedItem.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedItem.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedItem.location}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedItem.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Report Type">{selectedItem.reportType}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
              <Descriptions.Item label="Date Found">{selectedItem.dateFound}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </>
  );
};

export default Home;
