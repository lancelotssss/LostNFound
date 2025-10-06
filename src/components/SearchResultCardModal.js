import React, { useState } from "react";
import { Card, Modal, Button, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createClaim } from "../api";

const { Meta } = Card;
const { TextArea } = Input;

export function SearchResultCardModal({ item, onClaimSuccess }) {
  const [open, setOpen] = useState(false);
  const [claimMode, setClaimMode] = useState(false); // step 2 mode
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
    localStorage.removeItem("lostReferenceFound");
    setOpen(false);
    setClaimMode(false);
    form.resetFields();
  };
  const handleClaim = () => {

    localStorage.setItem("lostReferenceFound", item._id)

    setClaimMode(true);
  }
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = sessionStorage.getItem("User");
      const selectedLostId = localStorage.getItem("selectedLostId");
      const lostReferenceFound = localStorage.getItem("lostReferenceFound");


      const formData = new FormData();
      formData.append("itemId", item._id);
      formData.append("claimerId", user?.studentId);
      formData.append("reason", values.reason);
      if (selectedLostId) formData.append("selectedLostId", selectedLostId);
      if (lostReferenceFound) formData.append("lostReferenceFound", lostReferenceFound);


      if (values.image && values.image[0]) {
        formData.append("photo", values.image[0].originFileObj);
      }

      const result = await createClaim(formData, token);

      if (result.success) {
        localStorage.removeItem("selectedLostId");
        
        handleCancel();

        // ✅ Notify parent to remove the card
        if (onClaimSuccess) {
          onClaimSuccess(item._id);
        }
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
            src={
              item.photoUrl ||
              "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"
            }
            style={{ height: 180, objectFit: "cover" }}
          />
        }
        onClick={showModal}
      >
        <Meta
          title={item.keyItem}
          description={
            <>
              <p>
                <b>Category:</b> {item.category}
              </p>
              <p>
                <b>Brand:</b> {item.itemBrand || "N/A"}
              </p>
              <p>
                <b>Location:</b> {item.location}
              </p>
              <p>
                <b>Date Found:</b>{" "}
                {item.dateFound
                  ? new Date(item.dateFound).toLocaleDateString()
                  : "N/A"}
              </p>
            </>
          }
        />
      </Card>

      <Modal
        open={open}
        title={item.keyItem}
        onCancel={handleCancel}
        maskClosable={false}
        footer={null} // custom footer
        width={800} // wider to accommodate right panel
      >
        <div className="flex transition-all duration-500">
          {/* Left Side: Item Details */}
          <div className="w-1/2 pr-6">
            <img
              src={
                item.photoUrl ||
                "https://community.softr.io/uploads/db9110/original/2X/7/74e6e7e382d0ff5d7773ca9a87e6f6f8817a68a6.jpeg"
              }
              alt={item.keyItem}
              style={{
                width: "100%",
                marginBottom: "15px",
                borderRadius: "8px",
                objectFit: "cover",
              }}
            />
            <p>
              <b>Category:</b> {item.category}
            </p>
            <p>
              <b>Brand:</b> {item.itemBrand || "N/A"}
            </p>
            <p>
              <b>Location:</b> {item.location}
            </p>
            <p>
              <b>Date Found:</b>{" "}
              {item.dateFound
                ? new Date(item.dateFound).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <b>Description:</b> {item.description || "No description provided."}
            </p>

            {/* Step 1 Claim Button */}
            {!claimMode && (
              <Button type="primary" onClick={handleClaim}>
                Claim
              </Button>
            )}
          </div>

          {/* Right Side: Claim Form (Slides In) */}
          <div
            className={`w-1/2 pl-6 border-l transition-all duration-500 ${
              claimMode ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
            }`}
          >
            {claimMode && (
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

                <div className="flex justify-end gap-2">
                  <Button onClick={handleCancel}>Cancel</Button>
                  <Button type="primary" onClick={handleSubmit}>
                    Submit
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
