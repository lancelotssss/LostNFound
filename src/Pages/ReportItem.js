import React, { useState } from "react";
import { createReport } from "../api";
import axios from "axios";
import { useEffect } from "react";

export default function ReportItem() {
  const [audit, setAudit] = useState({
    uid: "",
    action: "NEW_REPORT",
    targetUser: "",
    performedBy: null,
    timestamp: new Date(),
    tickedId: null,
    details: "A user has created a report",
  });

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
  });

  useEffect(() => {
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

  function handleChange(e) {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newRegisterData = {
      ...registerData
      
    };
    const newAudit = {
          ...audit,
          timestamp: new Date(),
          details: `A user reported something.`,
        };
    
        // Send data to backend
        const response = await createReport(newRegisterData);
        const auditResponse = await createReport(newAudit);
    
        if (response.status !== 200 || auditResponse.status !== 200) {
          alert("User account or audit log could not be created");
        } else {
          alert("Registration successful!");
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
            <option>lost</option>
            <option>found</option>
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
