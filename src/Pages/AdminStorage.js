import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Descriptions, Image, message, Input } from "antd";
import { getStorage, approveFound, approveStorage  } from "../api";
import { jwtDecode } from "jwt-decode";
import {Form, Upload} from "antd";
import { UploadOutlined } from "@ant-design/icons";


const { TextArea } = Input;
const { Column } = Table;

export const AdminStorage = () => {
  const [data, setData] = useState([]);
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

  const handleClaim = () => {

    setClaimMode(true);

  }

  const handleApprove = () => setApproveModal(true);
  const handleDeny = () => setDenyModal(true);

  const confirmApprove = async () => {
  try {
    setConfirmLoading(true);
    const token = sessionStorage.getItem("User");

    // Ant Design validation
    const values = await form.validateFields();

    // Prepare payload
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
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Date Found" dataIndex="dateFound" key="dateFound" />
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
              <Descriptions.Item label="Description">{selectedItem.description}</Descriptions.Item>
            </Descriptions>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
              {!claimMode && (
              <Button type="primary" onClick={handleClaim}  disabled={selectedItem.status === "Claimed"}>
                Claim
              </Button>

              )}

               {/* Right Side: Claim Form (Slides In) */}
              <div
                className={`w-1/2 pl-6 border-l transition-all duration-500 ${
                  claimMode ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
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
        rules={[
          { required: true, message: "Please enter your Identification Card" },
        ]}
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
        initialValue={[]}
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
</div>


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
