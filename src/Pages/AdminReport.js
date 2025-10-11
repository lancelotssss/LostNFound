// src/Pages/AdminReport.js (or wherever you keep it)
import React, { useMemo, useState, useEffect } from "react";
import { Steps, Button, Card, Typography, Input, Select, DatePicker, message, Upload } from "antd";
import { DownloadOutlined, SearchOutlined, UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./styles/ReportItem.css";

const { Title } = Typography;

export const AdminReport = () => {
  const [registerData, setRegisterData] = useState({
    reportType: "",
    category: "",
    keyItem: "",
    itemBrand: "",
    location: "",
    startDate: "",
    endDate: "",
    dateFound: "",
    description: "",
    photoUrl: "",
    title: "",
    file: null,
  });

  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (current === 1) {
      setRegisterData((prev) => ({ ...prev, category: "" }));
    }
  }, [current]);

  function setField(name, value) {
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  }

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "reportType") {
      setRegisterData({
        reportType: value,
        category: "",
        keyItem: "",
        itemBrand: "",
        location: "",
        startDate: "",
        endDate: "",
        dateFound: "",
        description: "",
        photoUrl: "",
        title: "",
        file: null,
      });
      setCurrent(1);
    } else {
      setField(name, value);
    }
  }



  async function handleSubmit(e) {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in before submitting a report.");
        return;
      }

      const { reportType, category, keyItem, itemBrand } = registerData;
      const brandPart = itemBrand ? `, ${itemBrand}` : "";
      const generatedTitle = `${reportType} Item: ${category}: ${keyItem}${brandPart}`;

      const formData = new FormData();
      for (const key in registerData) {
        if (key === "file" && registerData.file) {
          formData.append("file", registerData.file);
        } else if (registerData[key] !== "") {
          formData.append(key, registerData[key]);
        }
      }
      formData.append("title", generatedTitle);

      const response = await fetch("http://localhost:3110/main/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        message.success("Report submitted successfully!");
        setRegisterData({
          reportType: "",
          category: "",
          keyItem: "",
          itemBrand: "",
          location: "",
          startDate: "",
          endDate: "",
          dateFound: "",
          description: "",
          photoUrl: "",
          title: "",
          file: null,
        });
        setCurrent(0);
      } else {
        message.error("Report submission failed");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      message.error("Error submitting report");
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { title: "Choose Type of Report", description: "Select Lost or Found" },
    { title: "Select Category", description: "Pick the closest category" },
    { title: "Item Details", description: "Name the item + brand" },
    { title: "When & Where", description: "Location and dates" },
    { title: "Describe & Upload", description: "Extra info and photo" },
  ];

  const handleStepChange = (value) => {
    // allow stepping back only (like client)
    if (value <= current) setCurrent(value);
  };

  // ---- Step gates (same logic as client) ----
  const canGoNextFrom2 = Boolean(registerData.category?.trim());
  const canGoNextFrom3 = Boolean(registerData.keyItem?.trim());
  const canGoNextFrom4 = (() => {
    if (!registerData.location?.trim()) return false;
    if (registerData.reportType === "Lost")
      return Boolean(registerData.startDate && registerData.endDate);
    if (registerData.reportType === "Found")
      return Boolean(registerData.dateFound);
    return false;
  })();

  const disableFuture = (cur) => cur && cur > dayjs().endOf("day");

  // -------------------- Step content --------------------
  const StepOne = (
    <div className="step-one">
      <Title level={4} className="step-title">WHAT DO YOU WANT TO REPORT</Title>
      <div className="step-one-container">
        <Button
          size="large"
          className="step-one-button"
          onClick={() => {
            setField("reportType", "Lost");
            setCurrent(1);
          }}
        >
          <div className="step-one-button-inner">
            <SearchOutlined className="step-one-button-icon" />
            <span className="step-one-button-title">REPORT MISSING ITEM</span>
            <span className="step-one-button-desc">
              Submit details about an item you lost or found so it can be recorded and matched in the system.
            </span>
          </div>
        </Button>

        <Button
          size="large"
          className="step-one-button"
          onClick={() => {
            setField("reportType", "Found");
            setCurrent(1);
          }}
        >
          <div className="step-one-button-inner">
            <DownloadOutlined className="step-one-button-icon" />
            <span className="step-one-button-title">REPORT FOUND ITEM</span>
            <span className="step-one-button-desc">
              Share where and when you found it so owners can identify and claim their items.
            </span>
          </div>
        </Button>
      </div>
    </div>
  );

  const StepTwo = (
    <div className="step-two">
      <Title level={4} className="step-title">
        {registerData.reportType === "Found"
          ? "WHAT CATEGORY OF AN ITEM DID YOU FIND?"
          : "WHAT CATEGORY OF AN ITEM DID YOU LOSE?"}
      </Title>

      <Select
        placeholder="SELECT A CATEGORY"
        value={registerData.category || undefined}
        onChange={(val) => {
          setRegisterData((prev) => ({
            ...prev,
            category: val,
            keyItem: "",
            itemBrand: "",
          }));
          // NOTE: do NOT auto-advance. Let the footer Next handle it.
        }}
        className="field-wide"
        options={[
          { value: "Gadgets", label: "Gadgets" },
          { value: "Identification Card", label: "Identification Card" },
          { value: "Personal Belongings", label: "Personal Belongings" },
          { value: "School Supplies", label: "School Supplies" },
          { value: "Wearables", label: "Wearables" },
          { value: "Others", label: "Others" },
        ]}
      />
    </div>
  );

  const StepThree = (
    <div className="step-three">
      <Title level={4} className="step-title">
        {registerData.reportType === "Found"
          ? "WHAT ITEM DID YOU FIND?"
          : "WHAT ITEM DID YOU LOSE?"}
      </Title>

      <div className="field-col">
        {registerData.category === "Others" ? (
          <Input
            name="keyItem"
            placeholder="Enter Item"
            value={registerData.keyItem}
            onChange={handleChange}
            className="field-wide"
          />
        ) : (
          <Select
            placeholder="Select an Item"
            value={registerData.keyItem || undefined}
            onChange={(val) => setField("keyItem", val)}
            className="field-wide"
            disabled={!registerData.category}
            options={
              registerData.category === "Gadgets"
                ? [
                    { value: "Audio Device", label: "Audio Device" },
                    { value: "Calculator", label: "Calculator" },
                    { value: "Charging Utilities", label: "Charging Utilities" },
                    { value: "CPU", label: "CPU" },
                    { value: "Laptop", label: "Laptop" },
                    { value: "Mobile Device", label: "Mobile Device" },
                    { value: "Power Bank", label: "Power Bank" },
                    { value: "Watch", label: "Watch" },
                    { value: "Others", label: "Others" },
                  ]
                : registerData.category === "Personal Belongings"
                ? [
                    { value: "Accessories", label: "Accessories" },
                    { value: "Bag", label: "Bag" },
                    { value: "Cosmetic Products", label: "Cosmetic Products" },
                    { value: "Handkerchief", label: "Handkerchief" },
                    { value: "Keys", label: "Keys" },
                    { value: "Tumbler", label: "Tumbler" },
                    { value: "Umbrella", label: "Umbrella" },
                    { value: "Wallet", label: "Wallet" },
                    { value: "Others", label: "Others" },
                  ]
                : registerData.category === "School Supplies"
                ? [
                    { value: "Architecture Materials", label: "Architecture Materials" },
                    { value: "Books", label: "Books" },
                    { value: "Medical Materials", label: "Medical Materials" },
                    { value: "Office Supplies", label: "Office Supplies" },
                    { value: "Pen", label: "Pen" },
                    { value: "Others", label: "Others" },
                  ]
                : registerData.category === "Wearables"
                ? [
                    { value: "Cap", label: "Cap" },
                    { value: "Eyeglass", label: "Eyeglass" },
                    { value: "Foot Wearables", label: "Foot Wearables" },
                    { value: "Hat", label: "Hat" },
                    { value: "Jacket", label: "Jacket" },
                    { value: "Lab Gown", label: "Lab Gown" },
                    { value: "T-shirt", label: "T-shirt" },
                    { value: "Trousers", label: "Trousers" },
                    { value: "Uniform", label: "Uniform" },
                    { value: "Others", label: "Others" },
                  ]
                : registerData.category === "Identification Card"
                ? [
                    { value: "Driver’s License", label: "Driver’s License" },
                    { value: "National ID", label: "National ID" },
                    { value: "Passport", label: "Passport" },
                    { value: "School ID", label: "School ID" },
                    { value: "Others", label: "Others" },
                  ]
                : []
            }
          />
        )}

        {registerData.category !== "Identification Card" && (
          <Input
            name="itemBrand"
            placeholder="ITEM NAME (required)"
            value={registerData.itemBrand}
            onChange={handleChange}
            className="field-wide"
            autoComplete="off"
          />
        )}
      </div>
    </div>
  );

  const StepFour = (
    <div className="step-four">
      <Title level={4} className="step-title">
        {registerData.reportType === "Found"
          ? "WHEN AND WHERE DID YOU FIND THE ITEM?"
          : "WHEN AND WHERE DID YOU LOSE THE ITEM?"}
      </Title>

      <div className="field-col">
        <Select
          placeholder="LOCATION"
          value={registerData.location || undefined}
          onChange={(val) => setField("location", val)}
          className="field-wide"
          options={[
            { value: "Ground Floor", label: "Ground Floor" },
            { value: "7th Floor", label: "7th Floor" },
            { value: "8th Floor", label: "8th Floor" },
            { value: "9th Floor", label: "9th Floor" },
            { value: "10th Floor", label: "10th Floor" },
            { value: "11th Floor", label: "11th Floor" },
            { value: "12th Floor", label: "12th Floor" },
            { value: "Outside of Campus", label: "Outside of Campus" },
          ]}
        />

        {registerData.reportType === "Lost" ? (
          <div className="date-row">
            <DatePicker
              className="field-half"
              placeholder="START DATE"
              value={registerData.startDate ? dayjs(registerData.startDate) : null}
              onChange={(_, dateStr) => {
                setField("startDate", dateStr);
                setField("endDate", "");
              }}
              disabledDate={disableFuture}
            />

            <DatePicker
              className="field-half"
              placeholder="END DATE"
              value={registerData.endDate ? dayjs(registerData.endDate) : null}
              onChange={(_, dateStr) => setField("endDate", dateStr)}
              disabled={!registerData.startDate}
              disabledDate={(cur) => {
                if (!registerData.startDate) return true;
                const start = dayjs(registerData.startDate);
                const maxEnd = start.add(5, "day");
                return cur < start || cur > maxEnd || cur > dayjs().endOf("day");
              }}
            />
          </div>
        ) : (
          <DatePicker
            className="field-wide"
            placeholder="DATE FOUND"
            value={registerData.dateFound ? dayjs(registerData.dateFound) : null}
            onChange={(_, dateStr) => setField("dateFound", dateStr)}
            disabledDate={disableFuture}
          />
        )}
      </div>
    </div>
  );

const StepFive = (
  <div className="step-five">
    <Title level={4} className="step-title">
      {registerData.reportType === "Found"
        ? "PLEASE DESCRIBE THE ITEM. A PHOTO WOULD HELP."
        : "PLEASE DESCRIBE YOUR MISSING ITEM. A PHOTO WOULD HELP."}
    </Title>
    <div className="field-col">
      <Input.TextArea
        name="description"
        rows={4}
        placeholder="DESCRIPTION"
        value={registerData.description}
        onChange={handleChange}
        className="field-wide"
      />

      <Upload
        name="file"
        listType="text"                // show filename only
        maxCount={1}
        beforeUpload={() => false}     // prevent auto upload; we'll submit via FormData
        accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.heic,.heif"
        onChange={(info) => {
          const file = info.fileList[0]?.originFileObj || null;
          setField("file", file);
        }}
        className="upload-field"
      >
        <Button icon={<UploadOutlined />}>Select or Upload Photo</Button>
      </Upload>
    </div>
  </div>
);


  const content = useMemo(() => {
    switch (current) {
      case 0:
        return StepOne;
      case 1:
        return StepTwo;
      case 2:
        return StepThree;
      case 3:
        return StepFour;
      case 4:
        return StepFive;
      default:
        return StepOne;
    }
  }, [current, registerData]);

  return (
    <form onSubmit={handleSubmit} className="report-wrap">
      <Card className="report-card">
        <Steps
          size="small"
          current={current}
          onChange={handleStepChange}
          items={steps.map((s) => ({ title: s.title, description: s.description }))}
        />

        <div className="step-content">{content}</div>

        {/* Single, shared footer fixes the “mispositioned Next” */}
        <div className="footer-actions">
          <Button
            className="footer-buttons"
            disabled={current === 0}
            onClick={() => setCurrent((p) => Math.max(p - 1, 0))}
          >
            Back
          </Button>

          {current === 1 && (
            <Button
              className="footer-buttons"
              type="primary"
              disabled={!canGoNextFrom2}
              onClick={() => setCurrent(2)}
            >
              Next
            </Button>
          )}

          {current === 2 && (
            <Button
              className="footer-buttons"
              type="primary"
              disabled={!canGoNextFrom3}
              onClick={() => setCurrent(3)}
            >
              Next
            </Button>
          )}

          {current === 3 && (
            <Button
              className="footer-buttons"
              type="primary"
              disabled={!canGoNextFrom4}
              onClick={() => setCurrent(4)}
            >
              Next
            </Button>
          )}

          {current === 4 && (
            <Button
              className="footer-buttons"
              type="primary"
              htmlType="submit"
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Confirm"}
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
};
