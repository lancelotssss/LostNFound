import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Popconfirm } from "antd";
import { getAllReport, deleteReport, getClaimDetailsClient } from "../api";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Column } = Table;

export const Home = () => {
  const [lost, setLost] = useState([]);
  const [found, setFound] = useState([]);
  const [claim, setClaim] = useState([]);

  
  const [selectedLost, setSelectedLost] = useState(null);
  const [selectedFound, setSelectedFound] = useState(null);
  const [isLostModalVisible, setIsLostModalVisible] = useState(false);
  const [isFoundModalVisible, setIsFoundModalVisible] = useState(false);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);


  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimDetails, setClaimDetails] = useState(null);
  const [isClaimModalVisible, setIsClaimModalVisible] = useState(false);

  const foundStatusOrder = ["Listed", "Reviewing", "Returned", "Reviewing Claim", "Denied", "Deleted"];
  const lostStatusOrder = ["Listed", "Reviewing", "Returned", "Reviewing Claim", "Denied", "Claim Rejected", "Deleted"];


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
        const formatDate = (d) => (d ? new Date(d).toLocaleString() : "N/A");

        const lostFormatted = (res.lostReports || []).map((item, index) => ({
        key: item._id || `lost-${index}`,
        ...item,
        dateReported: formatDate(item.dateReported),
        dateFound: formatDate(item.dateFound),
      })).sort((a, b) => {
        
        return lostStatusOrder.indexOf(a.status) - lostStatusOrder.indexOf(b.status);
      });

      const foundFormatted = (res.foundReports || []).map((item, index) => ({
        key: item._id || `found-${index}`,
        ...item,
        dateReported: formatDate(item.dateReported),
        dateFound: formatDate(item.dateFound),
      })).sort((a, b) => {
        return foundStatusOrder.indexOf(a.status) - foundStatusOrder.indexOf(b.status);
      });

      
      const claimFormatted = (res.claimReports || []).map((item, index) => ({
        key: item._id || `claim-${index}`,
        ...item,
        dateReported: formatDate(item.dateReported),
        dateFound: formatDate(item.dateFound),
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setLost(lostFormatted);
        setFound(foundFormatted);
        setClaim(claimFormatted);
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

  const handleLostClick = (record) => {
    setSelectedLost(record);
    setIsLostModalVisible(true);
  };

  const handleFoundClick = (record) => {
    setSelectedFound(record);
    setIsFoundModalVisible(true);
  };

  const handleRowLost = (record) => {
    if (record) {
      localStorage.setItem("selectedLostId", record._id);
      navigate("/cli/search/result", { state: { selectedItem: record } });
      setIsLostModalVisible(false);
    }
  };

  const handleLostModalClose = () => {
    setIsLostModalVisible(false);
    setSelectedLost(null);
  };

  const handleFoundModalClose = () => {
    setIsFoundModalVisible(false);
    setSelectedFound(null);
  };

  const handleDispose = async (id, type) => {
  const confirm = window.confirm("Are you sure you want to delete this report?");
  if (!confirm) return;

  try {
    const response = await axios.put(
      `http://localhost:3110/home/${id}/dispose`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      message.success(response.data.message);

      
      if (type === "Lost") {
        setLost((prev) =>
          prev.map((report) =>
            report._id === id ? { ...report, status: "Deleted" } : report
          )
        );
        
        if (selectedLost?._id === id) handleLostModalClose();
      } else if (type === "Found") {
        setFound((prev) =>
          prev.map((report) =>
            report._id === id ? { ...report, status: "Deleted" } : report
          )
        );
        
        if (selectedFound?._id === id) handleFoundModalClose();
      }

    } else {
      message.error("Failed to delete report");
    }
  } catch (err) {
    console.error("Delete error:", err);
    message.error("An error occurred while disposing the report.");
  }
};

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
    <>
      <div style={{ marginBottom: 16 }}>
        <p>Welcome, {user ? user.name : "Guest"} </p>
        <Button onClick={() => fetchData(sessionStorage.getItem("User"))}>Refresh</Button>
      </div>

      
      <h1>MY LOST TABLE</h1>
      <Table
        loading={loading}
        dataSource={lost}
        onRow={(record) => ({
          onClick: () => handleLostClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" render={(text) =>
    text && !isNaN(new Date(text))
      ? new Date(text).toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "N/A"
  }/>
      </Table>

      
      <h1>MY FOUND TABLE</h1>
      <Table
        loading={loading}
        dataSource={found}
        onRow={(record) => ({
          onClick: () => handleFoundClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" render={(text) =>
    text && !isNaN(new Date(text))
      ? new Date(text).toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "N/A"
  }/>
        
      </Table>

      
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
            onClick={() => handleRowLost(selectedLost)}
            disabled={selectedLost?.status?.toLowerCase() !== "listed"}
          >
            See similar items
          </Button>,
          <Button
            key="dispose"
            danger
            onClick={() => handleDispose(selectedLost._id, "Lost")}
            disabled={
            !["Listed", "Reviewing"].includes(
              selectedLost?.status
            )
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
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Image src={selectedLost.photoUrl} width={250} />
              </div>
            )}
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">{selectedLost.tid}</Descriptions.Item>
              <Descriptions.Item label="Title">{selectedLost.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedLost.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedLost.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedLost.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedLost.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedLost.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedLost.approvedBy ? selectedLost.approvedBy : "No actions yet."}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedLost.location}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedLost.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedLost.description}</Descriptions.Item>
              <Descriptions.Item label="Date Range Lost">{`${selectedLost.startDate} - ${selectedLost.endDate}` 
              ? `${new Date(selectedLost.startDate).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })} - 
              ${new Date(selectedLost.endDate).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}` : "No Information Provided"}</Descriptions.Item>
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
            onClick={() => handleDispose(selectedFound._id, "Found")}
            disabled={
            !["Active", "Pending Verification"].includes(
              selectedFound?.status
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
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <Image src={selectedFound.photoUrl} width={250} />
              </div>
            )}
            <Descriptions bordered column={1} size="middle">
              <Descriptions.Item label="TID">{selectedFound.tid}</Descriptions.Item>
              <Descriptions.Item label="Title">{selectedFound.title}</Descriptions.Item>
              <Descriptions.Item label="Category">{selectedFound.category}</Descriptions.Item>
              <Descriptions.Item label="Key Item">{selectedFound.keyItem}</Descriptions.Item>
              <Descriptions.Item label="Item Brand">{selectedFound.itemBrand}</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedFound.status}</Descriptions.Item>
              <Descriptions.Item label="Reported By">{selectedFound.reportedBy}</Descriptions.Item>
              <Descriptions.Item label="Approved By">{selectedFound.approvedBy}</Descriptions.Item>
              <Descriptions.Item label="Location">{selectedFound.location}</Descriptions.Item>
              <Descriptions.Item label="Date Reported">{selectedFound.dateReported}</Descriptions.Item>
              <Descriptions.Item label="Date Found">{new Date(selectedFound.dateFound).toLocaleDateString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })}</Descriptions.Item>
              <Descriptions.Item label="Description">{selectedFound.description}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>

      {/* CLAIM TABLE */}
      <h1>MY CLAIM TABLE</h1>
      <Table
        loading={loading}
        dataSource={claim}
        onRow={(record) => ({
          onClick: () => handleClaimRowClick(record),
          style: { cursor: "pointer" },
        })}
      >
        <Column title="Claim ID" dataIndex="cid" key="cid" />
        <Column title="Claimer ID" dataIndex="claimerId" key="claimerId" />
        <Column title="Claim Status" dataIndex="claimStatus" key="claimStatus" />
        <Column title="Created At" dataIndex="createdAt" key="createdAt" render={(text) =>
    text && !isNaN(new Date(text))
      ? new Date(text).toLocaleString("en-US", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
        })
      : "N/A"
  }/>
  
      </Table>

      {/* CLAIM MODAL */}
      <Modal
        title={selectedClaim ? "Claim Details" : "Item Details"}
        open={isClaimModalVisible}
        onCancel={handleClaimModalClose}
        footer={[
          <Button key="close" onClick={handleClaimModalClose}>
            Close
          </Button>,
        ]}
        width={1300}
        maskClosable={false}
        bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
      >
        {claimDetails ? (
          <div style={{ display: "flex", gap: 24 }}>
            {/* Found Item */}
            <div style={{ flex: 1 }}>
              <h3>Found Item Information</h3>
              {claimDetails?.foundItem?.photoUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Image src={claimDetails.foundItem.photoUrl} width={220} />
                </div>
              )}
              {claimDetails?.foundItem ? (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="TID">{claimDetails.foundItem.tid}</Descriptions.Item>
                  <Descriptions.Item label="Title">{claimDetails.foundItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{claimDetails.foundItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Location">{claimDetails.foundItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Date Found">
                    {claimDetails.foundItem.dateFound
                      ? new Date(claimDetails.foundItem.dateFound).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">{claimDetails.foundItem.status}</Descriptions.Item>
                   <Descriptions.Item label="Description">{claimDetails.foundItem.description}</Descriptions.Item>
                </Descriptions>
              ) : (
                <p style={{ color: "gray" }}>No found item data.</p>
              )}
            </div>

            {/* Lost Item */}
            <div style={{ flex: 1 }}>
              <h3>Lost Item Reference</h3>
              {claimDetails?.lostItem?.photoUrl && (
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <Image src={claimDetails.lostItem.photoUrl} width={220} />
                </div>
              )}
              {claimDetails?.lostItem ? (
                <Descriptions bordered column={1} size="middle">
                  <Descriptions.Item label="TID">{claimDetails.lostItem.tid}</Descriptions.Item>
                  <Descriptions.Item label="Title">{claimDetails.lostItem.title}</Descriptions.Item>
                  <Descriptions.Item label="Category">{claimDetails.lostItem.category}</Descriptions.Item>
                  <Descriptions.Item label="Location">{claimDetails.lostItem.location}</Descriptions.Item>
                  <Descriptions.Item label="Start Date">
                    {claimDetails.lostItem.startDate
                      ? new Date(claimDetails.lostItem.startDate).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="End Date">
                    {claimDetails.lostItem.endDate
                      ? new Date(claimDetails.lostItem.endDate).toLocaleString("en-US", {
                          month: "2-digit",
                          day: "2-digit",
                          year: "numeric",
                        })
                      : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">{claimDetails.lostItem.status}</Descriptions.Item>
                  <Descriptions.Item label="Description">{claimDetails.lostItem.description}</Descriptions.Item>
                </Descriptions>
              ) : (
                <p style={{ color: "gray" }}>No linked lost item found.</p>
              )}
            </div>

            {/* Claim Info */}
            <div style={{ flex: 1 }}>
              <h3>Claim Information</h3>
              {claimDetails?.claim ? (
                <>
                  {claimDetails.claim.photoUrl && (
                    <div style={{ textAlign: "center", marginBottom: 16 }}>
                      <Image src={claimDetails.claim.photoUrl} width={200} />
                    </div>
                  )}
                  <Descriptions bordered column={1} size="middle">
                    <Descriptions.Item label="Claim ID">{claimDetails.claim.cid}</Descriptions.Item>
                    <Descriptions.Item label="Claimer ID">{claimDetails.claim.claimerId}</Descriptions.Item>
                    <Descriptions.Item label="Claim Status">{claimDetails.claim.claimStatus}</Descriptions.Item>
                    <Descriptions.Item label="Admin Decision By">
                      {claimDetails.claim.adminDecisionBy ? claimDetails.claim.adminDecisionBy : "No actions yet."}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                      {claimDetails.claim.createdAt
                        ? new Date(claimDetails.claim.createdAt).toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reason">{claimDetails.claim.reason}</Descriptions.Item>
                  </Descriptions>
                </>
              ) : (
                <p style={{ color: "gray" }}>No claim record found for this item.</p>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: "gray" }}>No claim details available.</p>
        )}
      </Modal>
    </>
  );
};

export default Home;
