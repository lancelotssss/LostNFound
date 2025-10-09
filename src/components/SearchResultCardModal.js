// src/components/SearchResultCardModal.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Modal,
  Button,
  Descriptions,
  Image,
  Tag,
  message,
  Grid,
  Form,
  Input,
  Upload,
} from "antd";
import {
  EnvironmentOutlined,
  CalendarOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createClaim } from "../api"; // adjust path if needed

const { useBreakpoint } = Grid;
const { TextArea } = Input;

const STATUS_COLORS = {
  denied: "volcano",
  deleted: "volcano",
  pending: "orange",
  active: "blue",
  listed: "blue",
  reviewing: "orange",
  returned: "green",
  "reviewing claim": "orange",
  "claim rejected": "volcano",
  "claim approved": "blue",
  completed: "green",
};

const normalize = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();

export function SearchResultCardModal({ item, lostId, onClaimSuccess }) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [open, setOpen] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);

  // Guard: only send IDs that look like Mongo ObjectIds
  const isValidObjectId = (v) =>
    typeof v === "string" && /^[a-f\d]{24}$/i.test(v);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const decodedUser = jwtDecode(token);
        setUser(decodedUser || null);
      } catch {
        // ignore decode errors
      }
    }
    loadUserData();
  }, []);

  // Friend's naming: open modal
  const showModal = () => {
    setOpen(true);
    if (item?._id && isValidObjectId(item._id)) {
      localStorage.setItem("lostReferenceFound", item._id);
    } else {
      localStorage.removeItem("lostReferenceFound");
    }
  };

  // Friend's naming: close modal
  const handleCancel = () => {
    localStorage.removeItem("lostReferenceFound");
    setOpen(false);
    form.resetFields();
  };

  // Friend's naming: (kept for compatibility; proof is already visible)
  const handleClaim = () => {
    if (item?._id && isValidObjectId(item._id)) {
      localStorage.setItem("lostReferenceFound", item._id);
    }
  };

  // Parse title like: "Found Item: Gadgets: Mobile Device, iPhone 15"
  const parseTitle = (title) => {
    if (!title) return { category: "N/A", type: "N/A", name: "N/A" };
    const cleaned = title.replace(/^Found Item:\s*|^Lost Item:\s*/i, "").trim();
    const parts = cleaned.split(":").map((p) => p.trim());
    let category = parts[0] || "";
    let type = "";
    let name = "";
    if (parts[1]) {
      const subParts = parts[1].split(",").map((p) => p.trim());
      type = subParts[0] || "";
      name = subParts[1] || "";
    }
    return { category, type, name };
  };

  const statusKey = normalize(item?.status);
  const statusColor = STATUS_COLORS[statusKey] || "default";
  const { category, type, name } = parseTitle(item?.title || "");

  // Friend's naming: submit handler
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = sessionStorage.getItem("User");
      if (!token) {
        message.error("You must be logged in to claim an item.");
        return;
      }

      const selectedLostId = localStorage.getItem("selectedLostId") || "";
      const lostReferenceFound =
        localStorage.getItem("lostReferenceFound") || "";

      const formData = new FormData();

      // IDs (append only if valid to avoid Mongo ObjectId errors)
      if (item?._id && isValidObjectId(item._id)) {
        formData.append("itemId", item._id); // friend's key
        formData.append("foundId", item._id); // compatibility
      }

      if (lostId && isValidObjectId(lostId)) {
        formData.append("lostId", lostId);
        if (!selectedLostId) formData.append("selectedLostId", lostId);
      }

      if (selectedLostId && isValidObjectId(selectedLostId)) {
        formData.append("selectedLostId", selectedLostId);
      }

      if (lostReferenceFound && isValidObjectId(lostReferenceFound)) {
        formData.append("lostReferenceFound", lostReferenceFound);
      }

      // User identifiers
      if (user?.studentId) {
        formData.append("claimerId", user.studentId);
        formData.append("studentId", user.studentId);
      }
      if (user?._id) formData.append("userId", user._id);
      if (user?.id) formData.append("userId", user.id);
      if (user?.email) formData.append("email", user.email);

      // Required fields
      formData.append("reason", (values.reason || "").trim());
      if (values.image?.[0]?.originFileObj) {
        formData.append("photo", values.image[0].originFileObj);
      }

      setClaimLoading(true);

      const result = await createClaim(formData, token);

      if (result?.success) {
        message.success("Claim submitted!");
        localStorage.removeItem("selectedLostId");
        handleCancel();
        onClaimSuccess?.(item._id);
      } else {
        message.error(result?.error || "Failed to submit claim");
      }
    } catch (error) {
      if (error?.errorFields) {
        message.error("Please complete the form");
      } else {
        console.error("Validation/Submit Error:", error);
        message.error("An error occurred while creating the claim.");
      }
    } finally {
      setClaimLoading(false);
    }
  };

  // === Aliases for JSX compatibility ===
  const handleOpen = showModal;
  const handleClose = handleCancel;
  const submitClaim = handleSubmit;

  return (
    <>
      <Card
        className="usr-card"
        hoverable
        onClick={handleOpen}
        cover={
          <div className="result-thumb">
            {item?.photoUrl ? (
              <Image src={item.photoUrl} alt="Found item" preview={false} />
            ) : (
              <div className="result-thumb placeholder">
                <p className="no-image-placeholder">No image submitted</p>
              </div>
            )}
          </div>
        }
        actions={[
          <span key="view" className="usr-card-action">
            <EyeOutlined /> View
          </span>,
        ]}
      >
        <Card.Meta
          title={<div>{name || item?.keyItem || "Found item"}</div>}
          description={
            <div className="usr-card-desc">
              <div className="usr-card-line">
                <EnvironmentOutlined /> {item?.location || "—"}
              </div>
              <div className="usr-card-line">
                <CalendarOutlined />{" "}
                {item?.dateFound
                  ? new Date(item.dateFound).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>
              <Tag color={statusColor} className="usr-status-tag">
                {(item?.status || "—").toUpperCase().slice(0, 40)}
              </Tag>
            </div>
          }
        />
      </Card>

      <Modal
        title={item?.title || "Found Item Details"}
        open={open}
        onCancel={handleClose}
        width={isMobile ? "95%" : 800}
        className="result-modal"
        maskClosable={false}
        footer={[
          <Button key="cancel" onClick={handleClose}>
            Close
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={claimLoading}
            onClick={submitClaim}
          >
            Submit claim
          </Button>,
        ]}
        styles={{ body: { padding: 16 } }}
      >
        {/* Fixed-size image block */}
        <div className="fixed-photo-wrapper">
          <div className="photo-wrap fixed-photo">
            {item?.photoUrl ? (
              <Image src={item.photoUrl} alt="Found item" preview />
            ) : (
              <p className="no-image-placeholder">No image submitted</p>
            )}
          </div>
        </div>

        <Descriptions
          bordered
          column={1}
          size={isMobile ? "small" : "middle"}
          layout={isMobile ? "vertical" : "horizontal"}
          style={{ marginBottom: 16 }}
        >
          <Descriptions.Item label="TID">{item?.tid || "—"}</Descriptions.Item>
          <Descriptions.Item label="Title">
            {item?.title || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Category">
            {item?.category || category || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Type of Item">
            {type || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Item Name">
            {name || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Location">
            {item?.location || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Date Found">
            {item?.dateFound
              ? new Date(item.dateFound).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })
              : "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {item?.status || "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Description">
            {item?.description || "—"}
          </Descriptions.Item>
        </Descriptions>

        {/* Proof section is ALWAYS visible */}
        <Form
          form={form}
          layout="vertical"
          initialValues={{ reason: "" }}
          requiredMark="optional"
          className="form-proof"
        >
          <Form.Item
            label="Reason for claim"
            name="reason"
            rules={[
              { required: true, message: "Please enter your reason" },
              {
                min: 10,
                message: "Please provide more details (min 10 chars)",
              },
            ]}
            className="card-proof"
          >
            <TextArea
              rows={4}
              placeholder="Explain why this matches your lost item..."
            />
          </Form.Item>

          <Form.Item
            label="Upload image for proof"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) =>
              Array.isArray(e) ? e : e?.fileList
            }
            rules={[{ required: true, message: "Please upload a proof image" }]}
            extra={
              <div style={{ marginTop: "12px" }}>
                Add a clear photo that proves ownership (e.g., serial number,
                custom marks, screenshots of prior ownership).
              </div>
            }
            className="card-proof"
          >
            <Upload
              beforeUpload={() => false}
              listType="picture"
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default SearchResultCardModal;
