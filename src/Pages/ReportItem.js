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

      {registerData.reportType && (
          <div>
            {/* Category Selection */}
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

        {/* Step 3: Key Item & Brand */}
        {registerData.reportType && (
          <div>
            <p>
              Key Item{" "}
              {/* If 'Others' category is chosen, show a text input */}
              {registerData.category === "Others" ? (
                <input
                  type="text"
                  name="keyItem"
                  value={registerData.keyItem}
                  onChange={handleChange}
                  placeholder="Enter Item"
                />
              ) : (
                // Otherwise show dropdown based on category
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
                      <option>Hankerchief</option>
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
                      <option>Architech Materials</option>
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

                  {/* ID */}
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
