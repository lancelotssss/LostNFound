import React, { useState } from "react";
import { createReport } from "../api";


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
    file: null, // include file for upload
  });

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
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  }

  function handleFileChange(e) {
    setRegisterData({ ...registerData, file: e.target.files[0] });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in before submitting a report.");
        return;
      }

      // Generate dynamic title
      const { reportType, category, keyItem, itemBrand } = registerData;
      const brandPart = itemBrand ? `, ${itemBrand}` : "";
      const generatedTitle = `${reportType} Item: ${category}: ${keyItem}${brandPart}`;

      // Prepare FormData to include file if present
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
        alert("Report submitted successfully!");
      } else {
        console.log(data);
        alert("Report submission failed");
      }
    } catch (err) {
      console.error("Error submitting report:", err);
      alert("Error submitting report");
    }
  }

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
              <option>Gadgets</option>
              <option>Personal Belongings</option>
              <option>School Supplies</option>
              <option>Wearables</option>
              <option>Student ID</option>
              <option>Others</option>
            </select>
          </p>
        </div>
      )}

      {/* Step 3: KeyItem & Brand */}
      {registerData.category && (
        <>
          <div>
            <p>
              Item{" "}
              <input
                type="text"
                name="keyItem"
                placeholder="Item"
                value={registerData.keyItem}
                onChange={handleChange}
              />
            </p>
          </div>

          <div>
            <p>
              Item Brand{" "}
              <input
                type="text"
                name="itemBrand"
                placeholder="Brand (optional)"
                value={registerData.itemBrand}
                onChange={handleChange}
              />
            </p>
          </div>
        </>
      )}

      {/* Step 4: Lost vs Found */}
      {registerData.keyItem && (
        <>
          {/* Location */}
          <div>
            <p>
              Location{" "}
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={registerData.location}
                onChange={handleChange}
              />
            </p>
          </div>

          {/* Lost: Start + End Dates */}
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

          {/* Found: Date Found */}
          {registerData.reportType === "Found" &&
            registerData.location && (
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

          {/* Description */}
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
                    placeholder="Description"
                    value={registerData.description}
                    onChange={handleChange}
                  />
                </p>
              </div>

              {/* File Upload */}
              <div>
                <p>
                  Upload Photo{" "}
                  <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                  />
                </p>
              </div>

              <div>
                <button type="submit">SUBMIT REPORT</button>
              </div>
            </>
          )}
        </>
      )}
    </form>
  );
}
