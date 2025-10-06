import React, { useMemo, useState, useEffect } from "react";
import { Steps, Button, Card, Typography, Input, Select, DatePicker, message } from "antd";
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from "dayjs";
import "./styles/ReportItem.css";
import { createReport } from "../api";

const { Title } = Typography;

export default function ReportItem() {
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
    file: null, 
  });

  const [current, setCurrent] = useState(0);


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

  function handleFileChange(e) {
    setField("file", e.target.files?.[0] ?? null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

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

      const response = await fetch("http://localhost:3110/cli/report", {
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
    if (value <= current) setCurrent(value); 
  };

  const canGoNextFrom3 = registerData.keyItem?.trim();
  const canGoNextFrom4 = (() => {
    if (!registerData.location?.trim()) return false;
    if (registerData.reportType === "Lost")
      return Boolean(registerData.startDate && registerData.endDate);
    if (registerData.reportType === "Found")
      return Boolean(registerData.dateFound);
    return false;
  })();


  const disableFuture = (cur) => cur && cur > dayjs().endOf("day");

  // -------------------- Step content  --------------------
  const StepOne = (
    <div className="step-one">
      <Title level={4} className="step-title">WHAT DO YOU WANT TO REPORT</Title>
      <div className="step-one-container">

        <Button
          size="large"
          className="step-one-button"
          onClick={() => { setField("reportType", "Lost"); setCurrent(1); }}
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
          onClick={() => { setField("reportType", "Found"); setCurrent(1); }}
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
          setField("category", val);
          setCurrent(2);
        }}
        className="field-wide"
        options={[
          { value: "Gadgets", label: "Gadgets" },
          { value: "Personal Belongings", label: "Personal Belongings" },
          { value: "School Supplies", label: "School Supplies" },
          { value: "Wearables", label: "Wearables" },
          { value: "Student ID", label: "Student ID" },
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
        <Input
          name="keyItem"
          placeholder="ITEM NAME"
          value={registerData.keyItem}
          onChange={handleChange}
          className="field-wide"
        />
        <Input
          name="itemBrand"
          placeholder="ITEM BRAND (optional)"
          value={registerData.itemBrand}
          onChange={handleChange}
          className="field-wide"
        />
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
        <Input
          name="location"
          placeholder="LOCATION"
          value={registerData.location}
          onChange={handleChange}
          className="field-wide"
        />

        {registerData.reportType === "Lost" ? (
          <div className="date-row">
            <DatePicker
              className="field-half"
              placeholder="START DATE"
              value={registerData.startDate ? dayjs(registerData.startDate) : null}
              onChange={(_, dateStr) => setField("startDate", dateStr)}
              disabledDate={disableFuture}
            />
            <DatePicker
              className="field-half"
              placeholder="END DATE"
              value={registerData.endDate ? dayjs(registerData.endDate) : null}
              onChange={(_, dateStr) => setField("endDate", dateStr)}
              disabledDate={disableFuture}
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
        <input type="file" name="file" onChange={handleFileChange} />
      </div>
    </div>
  );

  const content = useMemo(() => {
    switch (current) {
      case 0: return StepOne;
      case 1: return StepTwo;
      case 2: return StepThree;
      case 3: return StepFour;
      case 4: return StepFive;
      default: return StepOne;
    }
  }, [current, registerData]);

  return (
    <form onSubmit={handleSubmit} className="report-wrap">
      <Card className="report-card">
        <Steps
        size="small"
          current={current}
          onChange={handleStepChange}
          items={steps.map(s => ({ title: s.title, description: s.description }))}
        />

        <div className="step-content">{content}</div>

        <div className="footer-actions">
          <Button className="footer-buttons" disabled={current === 0} onClick={() => setCurrent(p => Math.max(p - 1, 0))}>
            Back
          </Button>
          {current === 2 && (
            <Button className="footer-buttons" type="primary" disabled={!canGoNextFrom3} onClick={() => setCurrent(3)}>
              Next
            </Button>
          )}
          {current === 3 && (
            <Button className="footer-buttons" type="primary" disabled={!canGoNextFrom4} onClick={() => setCurrent(4)}>
              Next
            </Button>
          )}
          {current === 4 && (
            <Button className="footer-buttons" type="primary" htmlType="submit">
              Confirm
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
  return (
  <form onSubmit={handleSubmit}>
    <h1>Lost and Found Report</h1>

    {/* Step 1: Report Type */}
    <div>
      <p>Type of Report</p>
      <label>
        <input
          type="radio"
          name="reportType"
          value="Lost"
          checked={registerData.reportType === "Lost"}
          onChange={handleChange}
        />{" "}
        Lost
      </label>
      <label>
        <input
          type="radio"
          name="reportType"
          value="Found"
          checked={registerData.reportType === "Found"}
          onChange={handleChange}
        />{" "}
        Found
      </label>
    </div>

    {/* Step 2: Category */}
    {registerData.reportType && (
      <div>
        <p>
          Category{" "}
          <select
            name="category"
            value={registerData.category}
            onChange={handleChange}
          >
            <option value="">Select Category</option>
            <option value="Gadgets">Gadgets</option>
            <option value="Personal Belongings">Personal Belongings</option>
            <option value="School Supplies">School Supplies</option>
            <option value="Wearables">Wearables</option>
            <option value="Identification Card">Identification Card</option>
            <option value="Others">Others</option>
          </select>
        </p>
      </div>
    )}

    {/* Step 3: Key Item */}
    {registerData.reportType && (
      <div>
        <p>
          Key Item{" "}
          {registerData.category === "Others" ? (
            <input
              type="text"
              name="keyItem"
              value={registerData.keyItem}
              onChange={handleChange}
              placeholder="Enter Item"
            />
          ) : (
            <select
              name="keyItem"
              value={registerData.keyItem}
              onChange={handleChange}
              disabled={!registerData.category}
            >
              <option value="">Select Item</option>

              {/* Gadgets */}
              {registerData.category === "Gadgets" && (
                <>
                  <option>Mobile Device</option>
                  <option>Laptop</option>
                  <option>Watch</option>
                  <option>Calculator</option>
                  <option>Power Bank</option>
                  <option>Charging Utilities</option>
                  <option>CPU</option>
                  <option>Audio Device</option>
                  <option>Others</option>
                </>
              )}

              {/* Personal Belongings */}
              {registerData.category === "Personal Belongings" && (
                <>
                  <option>Wallet</option>
                  <option>Tumbler</option>
                  <option>Bag</option>
                  <option>Accessories</option>
                  <option>Cosmetic Products</option>
                  <option>Handkerchief</option>
                  <option>Umbrella</option>
                  <option>Keys</option>
                  <option>Others</option>
                </>
              )}

              {/* School Supplies */}
              {registerData.category === "School Supplies" && (
                <>
                  <option>Office Supplies</option>
                  <option>Pen</option>
                  <option>Books</option>
                  <option>Architecture Materials</option>
                  <option>Medical Materials</option>
                  <option>Others</option>
                </>
              )}

              {/* Wearables */}
              {registerData.category === "Wearables" && (
                <>
                  <option>Eyeglass</option>
                  <option>Jacket</option>
                  <option>Hat</option>
                  <option>T-shirt</option>
                  <option>Lab Gown</option>
                  <option>Uniform</option>
                  <option>Foot Wearables</option>
                  <option>Cap</option>
                  <option>Trousers</option>
                  <option>Others</option>
                </>
              )}

              {/* Identification Card */}
              {registerData.category === "Identification Card" && (
                <>
                  <option>School ID</option>
                  <option>National ID</option>
                  <option>Passport</option>
                  <option>Driver’s License</option>
                  <option>Others</option>
                </>
              )}
            </select>
          )}
        </p>
      </div>
    )}

    {/* Step 4: Item Brand */}
    {registerData.keyItem && (
      <div>
        <p>
          Item Brand{" "}
          <input
            type="text"
            name="itemBrand"
            placeholder="Enter Item Brand"
            value={registerData.itemBrand}
            onChange={handleChange}
          />
        </p>
      </div>
    )}

    {/* Step 5: Location */}
    {registerData.itemBrand && (
      <div>
        <p>
          Location{" "}
          <input
            type="text"
            name="location"
            placeholder="Enter Location"
            value={registerData.location}
            onChange={handleChange}
          />
        </p>
      </div>
    )}

    {/* Step 6: Date Inputs */}
    {registerData.reportType === "Lost" && registerData.location && (
      <>
        <p>
          Start Date{" "}
          <input
            type="date"
            name="startDate"
            value={registerData.startDate}
            onChange={handleChange}
          />
        </p>
        <p>
          End Date{" "}
          <input
            type="date"
            name="endDate"
            value={registerData.endDate}
            onChange={handleChange}
          />
        </p>
      </>
    )}

    {registerData.reportType === "Found" && registerData.location && (
      <p>
        Date Found{" "}
        <input
          type="date"
          name="dateFound"
          value={registerData.dateFound}
          onChange={handleChange}
        />
      </p>
    )}

    {/* Step 7: Description and File Upload */}
    {((registerData.reportType === "Lost" &&
      registerData.startDate &&
      registerData.endDate) ||
      (registerData.reportType === "Found" &&
        registerData.dateFound)) && (
      <>
        <div>
          <p>
            Description{" "}
            <textarea
              name="description"
              placeholder="Enter Description"
              value={registerData.description}
              onChange={handleChange}
            />
          </p>
        </div>

        <div>
          <p>
            Upload Photo{" "}
            <input type="file" name="file" onChange={handleFileChange} />
          </p>
        </div>

        <div>
          <button type="submit">SUBMIT REPORT</button>
        </div>
      </>
    )}
  </form>
);
}
