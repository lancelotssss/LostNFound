import { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input, Form, Upload, Typography, Tag } from "antd";
import { getStorage, approveFound, approveStorage } from "../api";
import { jwtDecode } from "jwt-decode";
import { UploadOutlined } from "@ant-design/icons";
import "./styles/ant-input.css";

const { TextArea } = Input;
const { Column } = Table;
const { Text } = Typography;

export const AdminStorage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); 
  const [searchText, setSearchText] = useState(""); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [claimMode, setClaimMode] = useState(false);
  const [form] = Form.useForm();

  
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

      const res = await getStorage(token);
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          _id: item._id ? item._id.toString() : null,
          ...item,
          dateReported: item.dateReported ? new Date(item.dateReported).toLocaleString() : "N/A",
          dateFound: item.dateFound ? new Date(item.dateFound).toLocaleDateString() : "N/A",
          approvedBy: item.approvedBy ? item.approvedBy : "No actions yet",
        }));

        setData(formattedData);
        setFilteredData(formattedData); 
      }
    } catch (err) {
      console.error("Error fetching found items:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
    } else {
      const filtered = data.filter(
        (item) =>
          item.tid?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.keyItem?.toLowerCase().includes(searchText.toLowerCase()) ||
          item.itemBrand?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchText, data]);

  // ---------------- Modal logic ----------------

  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleClaim = () => setClaimMode(true);
  const handleApprove = () => setApproveModal(true);
  const handleDeny = () => setDenyModal(true);

  const confirmApprove = async () => {
    try {
      setConfirmLoading(true);
      const token = sessionStorage.getItem("User");

      const values = await form.validateFields();

      const claimPayload = {
        itemId: selectedItem._id,
        claimerId: values.id,
        reason: values.reason,
        adminDecisionBy: user.studentId,
        photoUrl: values.image[0]?.originFileObj
          ? URL.createObjectURL(values.image[0].originFileObj)
          : "",
        selectedLostId: selectedItem._id,
        lostReferenceFound: selectedItem._id,
      };

      const res = await approveStorage(claimPayload, token);

      if (res.success) {
        message.success("Claim report submitted successfully!");
        setClaimMode(false);
        setApproveModal(false);
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(res.message || "Failed to submit claim report");
      }
    } catch (err) {
      console.error(err);
      message.error("Please fill all required fields correctly.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const confirmDeny = async () => {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");
    try {
      await approveFound(selectedItem._id, "Disposed", user.studentId, token);
      message.success("Item disposed successfully!");
      setDenyModal(false);
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      console.error(err);
      message.error("Failed to dispose item.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const STATUS_COLORS = {
    denied: "volcano",
    deleted: "volcano",
    disposed: "volcano",
    pending: "orange",
    "pending claimed": "orange",
    active: "blue",
    claimed: "green",
    listed: "blue",
    reviewing: "orange",
    returned: "green",
    "reviewing claim": "orange",
    "claim rejected": "volcano",
    "claim approved": "blue",
    completed: "green",
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Button onClick={fetchData}>Refresh</Button>

        
        <Input
          className="poppins-input"
          placeholder="Search by TID, Key Item, or Brand"
          allowClear
          style={{ width: 300 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <Table
        dataSource={filteredData}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          style: { cursor: "pointer" },
        })}
        pagination={{ pageSize: 8 }}
      >
        <Column title="CATEGORY" dataIndex="category" key="category" />
        <Column title="ITEM NAME" dataIndex="keyItem" key="keyItem" />
        <Column title="BRAND" dataIndex="itemBrand" key="itemBrand" />
        <Column title="LOCATION" dataIndex="location" key="location" />
        <Column title="STATUS" dataIndex="status" key="status" render={(status) => {
              const color = STATUS_COLORS[status?.toLowerCase()] || "default";
              return (
                <Tag color={color} style={{ fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                  {status ? status.toUpperCase() : "N/A"}
                </Tag>
              );
            }}/>
        <Column title="DATE REPORTED" dataIndex="dateReported" key="dateReported" />
        <Column title="DATE FOUND" dataIndex="dateFound" key="dateFound" />
      </Table>

      {/* -------------------- MODALS -------------------- */}

      <Modal
        title={selectedItem ? selectedItem.tid : "Storage Item Details"}
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
                <Text copyable style={{fontFamily:"Poppins"}}>{selectedItem.tid}</Text>
                </Descriptions.Item>  
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              {!claimMode && (
                <Button type="primary" onClick={handleClaim} disabled={selectedItem.status === "Claimed"}>
                  Claim
                </Button>
              )}

              {claimMode && (
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    id: "",
                    reason: "",
                    image: [],
                  }}
                >
                  <Form.Item
                    label="Identification Card"
                    name="id"
                    rules={[{ required: true, message: "Please enter your Identification Card" }]}
                  >
                    <Input placeholder="Enter your Identification Card" />
                  </Form.Item>

                  <Form.Item
                    label="Reason for Claim"
                    name="reason"
                    rules={[{ required: true, message: "Please enter a reason" }]}
                  >
                    <TextArea rows={4} placeholder="Enter your reason" />
                  </Form.Item>

                  <Form.Item
                    label="Upload Proof Image"
                    name="image"
                    valuePropName="fileList"
                    getValueFromEvent={(e) => e?.fileList || []}
                    rules={[{ required: true, message: "Please upload an image" }]}
                  >
                    <Upload beforeUpload={() => false} listType="picture">
                      <Button icon={<UploadOutlined />}>Click to Upload</Button>
                    </Upload>
                  </Form.Item>

                  <div className="flex justify-end gap-2">
                    <Button onClick={handleModalClose}>Cancel</Button>
                    <Button type="primary" onClick={handleApprove}>
                      Submit
                    </Button>
                  </div>
                </Form>
              )}

              <Button danger onClick={handleDeny} disabled={selectedItem.status === "Dispose"}>
                Dispose
              </Button>
              <Button onClick={handleModalClose}>Cancel</Button>
            </div>
          </>
        )}
      </Modal>

      {/* Approve Confirmation */}
      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
      >
        <p>Are you sure you want to authorize claim this item?</p>
      </Modal>

      {/* Deny Confirmation */}
      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
      >
        <p>Are you sure you want to authorize dispose this item?</p>
      </Modal>
    </>
  );
};
