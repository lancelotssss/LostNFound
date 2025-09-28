import React, { useState } from "react";
import { createReport } from "../api";

export default function ReportItem() {
  const [registerData, setRegisterData] = useState({
    title: "",
    category: "",
    keyItem: "",
    itemBrand: "",
    description: "",
    status: "",
    reportType: "",
    reportedBy: "",
    approvedBy: "",
    location: "",
    dateLostOrFound: "",
    startDate: "",
    endDate: "",
    updatedAt: "",
    photoUrl: "",
    aid: "",
    action: "",
    targetUser: "",
    performedBy: "",
    timestamp: "",
    ticketId: "",
    details: "",
  });

  
  /*useEffect(() => {
    axios
      .post("http://localhost:3110/cli/report", {
        test: true, // dummy payload just to trigger verifyToken
      })
      .then((res) => {

      })
      .catch((err) => {
        if (err.response) {
        } else {
        }
      });
  }, []);
  */
  

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // ✅ fetch token from sessionStorage
      const token = sessionStorage.getItem("User");
      if (!token) {
        alert("You must be logged in before submitting a report.");
        return;
      }

      const response = await createReport(registerData, token); // ✅ pass token
      console.log("response: " , response)
      if (!response.success) {
        alert("Report could not be created.");
        console.log(response, token, registerData)
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

      <div>
        <p>
          Title{" "}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={registerData.title}
            onChange={handleChange}
          />
        </p>
      </div>

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
          Type of Report{" "}
          <select
            name="reportType"
            value={registerData.reportType}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option>Lost</option>
            <option>Found</option>
          </select>
        </p>
      </div>

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

      <div>
        <p>
          Date of Lost/Found{" "}
          <input
            type="date"
            name="dateLostOrFound"
            value={registerData.dateLostOrFound}
            onChange={handleChange}
          />
        </p>
      </div>

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
      </div>
      <div>
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
    </form>
  );
}
