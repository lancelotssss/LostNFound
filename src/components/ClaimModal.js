import React, { useState, useEffect } from "react";
import { Card, Modal, Button, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createClaim } from "../api";

const { Meta } = Card;
const { TextArea } = Input;

export function ClaimModal({ item, onClaimSuccess }) {
  const [open, setOpen] = useState(false);
  const [claimMode, setClaimMode] = useState(false);
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
    }
    loadUserData();
  }, []);

  const showModal = () => setOpen(true);
  const handleCancel = () => {
    setOpen(false);
    setClaimMode(false);
    form.resetFields();
  };
  const handleClaim = () => setClaimMode(true);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = sessionStorage.getItem("User");

      const formData = new FormData();
      formData.append("itemId", item._id);
      formData.append("claimerId", user?.studentId);
      formData.append("reason", values.reason);

      if (values.image && values.image[0]) {
        formData.append("photo", values.image[0].originFileObj);
      }

      const result = await createClaim(formData, token);

      if (result.success) {
        handleCancel();

        // Notify parent to remove this item
        if (onClaimSuccess) onClaimSuccess(item._id);
      } else {
        message.error(result.error || "Failed to submit claim");
      }
    } catch (error) {
      console.error("Validation Failed:", error);
      message.error("Please complete the form");
    }
  };

  return (
    <>
      <Card
        hoverable
        style={{ width: 240 }}
        cover={
          <img
            draggable={false}
            alt={item.keyItem}
            src={item.photoUrl || "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"}
            style={{ height: 180, objectFit: "cover" }}
          />
        }
        onClick={showModal}
      >
        <Meta
          title={item.keyItem}
          description={
            <>
              <p><b>Category:</b> {item.category}</p>
              <p><b>Brand:</b> {item.itemBrand || "N/A"}</p>
              <p><b>Location:</b> {item.location}</p>
              <p><b>Date Found:</b> {item.dateFound ? new Date(item.dateFound).toLocaleDateString() : "N/A"}</p>
            </>
          }
        />
      </Card>

      <Modal
        open={open}
        title={item.keyItem}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null}
        width={800}
      >
        <div style={{ display: "flex" }}>
          {/* Left side: Item details */}
          <div style={{ flex: 1, paddingRight: 16 }}>
            <img
              src={item.photoUrl || "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"}
              alt={item.keyItem}
              style={{ width: "100%", marginBottom: 15, borderRadius: 8, objectFit: "cover" }}
            />
            <p><b>Category:</b> {item.category}</p>
            <p><b>Brand:</b> {item.itemBrand || "N/A"}</p>
            <p><b>Location:</b> {item.location}</p>
            <p><b>Date Found:</b> {item.dateFound ? new Date(item.dateFound).toLocaleDateString() : "N/A"}</p>
            <p><b>Description:</b> {item.description || "No description provided."}</p>

            {!claimMode && <Button type="primary" onClick={handleClaim}>Claim</Button>}
          </div>

          {/* Right side: Claim form */}
          {claimMode && (
            <div style={{ flex: 1, paddingLeft: 16, borderLeft: "1px solid #f0f0f0" }}>
              <Form form={form} layout="vertical">
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
                  getValueFromEvent={(e) => e.fileList}
                  rules={[{ required: true, message: "Please upload an image" }]}
                >
                  <Upload beforeUpload={() => false} listType="picture">
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                </Form.Item>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" onClick={handleSubmit}>Submit</Button>
                </div>
              </Form>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
