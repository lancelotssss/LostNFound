import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Descriptions,
  Image,
  message,
  Input,
  Form,
  Upload,
  Typography,
  Tag,
} from "antd";
import { getStorage, approveFound, approveStorage } from "../api";
import { jwtDecode } from "jwt-decode";
import { UploadOutlined, ReloadOutlined, SyncOutlined } from "@ant-design/icons";
import "./styles/ant-input.css";
import "./styles/AdminHistory.css";

const { TextArea } = Input;
const { Column } = Table;
const { Text } = Typography;

export const AdminStorage = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // confirmations
  const [approveModal, setApproveModal] = useState(false);
  const [denyModal, setDenyModal] = useState(false);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const [user, setUser] = useState(null);

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
          dateReported: item.dateReported
            ? new Date(item.dateReported).toLocaleString()
            : "N/A",
          dateFound: item.dateFound
            ? new Date(item.dateFound).toLocaleDateString()
            : "N/A",
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
      const s = searchText.toLowerCase();
      const filtered = data.filter(
        (item) =>
          item.tid?.toLowerCase().includes(s) ||
          item.keyItem?.toLowerCase().includes(s) ||
          item.itemBrand?.toLowerCase().includes(s)
      );
      setFilteredData(filtered);
    }
  }, [searchText, data]);

  // ---------------- Modal logic ----------------
  const handleRowClick = (record) => {
    setSelectedItem(record);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
    form.resetFields();
  };

  // Submit button -> validate first; if valid open confirm
  const handleSubmitClick = async () => {
    try {
      await form.validateFields();
      setApproveModal(true); // open confirm only when valid
    } catch {
      // invalid: antd shows errors; no confirm
    }
  };

  const confirmApprove = async () => {
    // Close confirm immediately to avoid it lingering during validation/API
    setApproveModal(false);
    setConfirmLoading(true);

    try {
      const values = form.getFieldsValue();

      const token = sessionStorage.getItem("User");
      if (!token || !selectedItem?._id) {
        message.error("Missing session or item.");
        setConfirmLoading(false);
        return;
      }

      const claimPayload = {
        itemId: selectedItem._id,
        claimerId: values.id,
        reason: values.reason,
        adminDecisionBy: user?.studentId,
        photoUrl:
          values.image?.[0]?.originFileObj
            ? URL.createObjectURL(values.image[0].originFileObj)
            : "",
        // kept for compatibility
        selectedLostId: selectedItem._id,
        lostReferenceFound: selectedItem._id,
      };

      const res = await approveStorage(claimPayload, token);

      if (res.success) {
        message.success("Claim report submitted successfully!");
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(res.message || "Failed to submit claim report");
      }
    } catch (err) {
      console.error(err);
      message.error("An unexpected error occurred.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDeny = () => setDenyModal(true);

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





      
      <div className="table-controls">





        {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- LEFT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
        <div className="panel panel--filters">
          <div className="panel-title">Search Filters</div>
          <div className="panel-body">
            <Input
              className="poppins-input"
              placeholder="Search by TID, Key Item, or Brand"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: "1 1 320px", minWidth: 240 }}
            />
          </div>
        </div>

        {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- RIGHT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
        <div className="panel panel--actions">
          <div className="panel-title">Actions</div>
          <div className="panel-body panel-actions-row">
            <div style={{ marginRight: "auto" }} />
            <Button onClick={fetchData} className="btn-with-icons">
              <ReloadOutlined />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
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
        <Column
          title="STATUS"
          dataIndex="status"
          key="status"
          render={(status) => {
            const color = STATUS_COLORS[status?.toLowerCase()] || "default";
            return (
              <Tag color={color} style={{ fontWeight: 500, fontFamily: "Poppins, sans-serif" }}>
                {status ? status.toUpperCase() : "N/A"}
              </Tag>
            );
          }}
        />
        <Column title="DATE REPORTED" dataIndex="dateReported" key="dateReported" />
        <Column title="DATE FOUND" dataIndex="dateFound" key="dateFound" />
      </Table>






      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- MGA MODAL =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <Modal
        title={selectedItem ? "Storage Item Details" : "Storage Item Details"}
        open={isModalVisible}
        onCancel={handleModalClose}
        maskClosable={false}
        width={800}
        centered
        styles={{
          header: { position: "sticky", top: 0, zIndex: 2, background: "#fff" },
          body: { padding: 16, maxHeight: "85vh", overflowY: "auto" },
          footer: { position: "sticky", bottom: 0, zIndex: 2, background: "#fff" },
        }}
        footer={
          selectedItem
            ? [
                <Button key="submit" type="primary" onClick={handleSubmitClick}>
                  Submit
                </Button>,
                <Button
                  key="dispose"
                  danger
                  onClick={handleDeny}
                  disabled={selectedItem.status === "Dispose"}
                >
                  Dispose
                </Button>,
                <Button key="cancel" onClick={handleModalClose}>
                  Close
                </Button>,
              ]
            : null
        }
      >

        {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- CONTENT NG MODAL =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
        {selectedItem && (
          <>
            {/* Fixed-size image */}
            <div
              className="photo-wrap fixed-photo"
              style={{ maxWidth: 180, height: 200, margin: "8px auto 16px" }}
            >
              {selectedItem.photoUrl ? (
                <Image
                  src={selectedItem.photoUrl}
                  alt="Stored item"
                  preview
                  style={{ objectFit: "contain", maxHeight: "100%" }}
                />
              ) : (
                <p className="no-image-placeholder" style={{ textAlign: "center", color: "#999" }}>
                  No image submitted
                </p>
              )}
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="TID">
                <Text copyable style={{ fontFamily: "Poppins" }}>
                  {selectedItem.tid}
                </Text>
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

            {/* Proof Form (always visible) */}
            <Form
              form={form}
              layout="vertical"
              style={{ marginTop: 16 }}
              initialValues={{ id: "", reason: "", image: [] }}
              requiredMark="optional"
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
                rules={[
                  { required: true, message: "Please enter a reason" },
                  { min: 10, message: "Please provide more details (min 10 chars)" },
                ]}
              >
                <TextArea rows={4} placeholder="Explain why this matches the owner’s claim..." />
              </Form.Item>

              <Form.Item
                label="Upload Proof Image"
                name="image"
                valuePropName="fileList"
                getValueFromEvent={(e) => e?.fileList || []}
                rules={[{ required: true, message: "Please upload an image" }]}
              >
                <Upload beforeUpload={() => false} listType="picture" maxCount={1} accept="image/*">
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>






      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- MODAL CONFIRM =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <Modal
        title="Confirm Approval"
        open={approveModal}
        onOk={confirmApprove}
        confirmLoading={confirmLoading}
        onCancel={() => setApproveModal(false)}
        centered
      >
        <p>Are you sure you want to authorize claim this item?</p>
      </Modal>







      <Modal
        title="Confirm Denial"
        open={denyModal}
        onOk={confirmDeny}
        confirmLoading={confirmLoading}
        onCancel={() => setDenyModal(false)}
        centered
      >
        <p>Are you sure you want to authorize dispose this item?</p>
      </Modal>
    </>
  );
};
