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
    title: ""
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
      });
    } else {
      setRegisterData({ ...registerData, [name]: value });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in before submitting a report.");
        return;
      }

      const {reportType, category, keyItem, itemBrand} = registerData
      const brandPart = itemBrand ? `, ${itemBrand}` : ""
      const generatedTitle = `${reportType} Item: ${category}: ${keyItem}${brandPart}`;

      const finalData = { ...registerData, title: generatedTitle}
      const response = await createReport(finalData, token);

      if (!response.success) {
        alert("Report could not be created.");
        console.log(response, token, registerData);
      } else {
        alert("Report submitted successfully!");
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
          {registerData.reportType === "Lost" ? (
            <>
              {/* Location first */}
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

              {/* Show Start + End together */}
              {registerData.location && (
                <div>
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
                </div>
              )}

              {/* Only when both filled → final section */}
              {registerData.startDate && registerData.endDate && (
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

                  <div>
                    <p>
                      Photo URL{" "}
                      <input
                        type="text"
                        name="photoUrl"
                        placeholder="Photo URL"
                        value={registerData.photoUrl}
                        onChange={handleChange}
                      />
                    </p>
                  </div>

                  <div>
                    <button type="submit">SUBMIT REPORT</button>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Found: Location + Date Found */}
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

              {registerData.location && (
                <div>
                  <p>
                    Date Found{" "}
                    <input
                      type="date"
                      name="dateFound"
                      value={registerData.dateFound}
                      onChange={handleChange}
                    />
                  </p>
                </div>
              )}

              {/* Show final section only when dateFound filled */}
              {registerData.location && registerData.dateFound && (
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

                  <div>
                    <p>
                      Photo URL{" "}
                      <input
                        type="text"
                        name="photoUrl"
                        placeholder="Photo URL"
                        value={registerData.photoUrl}
                        onChange={handleChange}
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
        </>
      )}
    </form>
  );
}
