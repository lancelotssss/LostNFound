import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getAllReport, getClaimReport } from "../api";
import { Table } from "antd";
import axios from "axios";

export function Profile() {
  const [found, setFound] = useState([]);
  const [user, setUser] = useState({});
  const [foundCounts, setFoundCounts] = useState(0);
  const [lostCounts, setLostCounts] = useState(0);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decodedUser = jwtDecode(token);
      setUser(decodedUser);

      const allReports = await getAllReport(token);
      console.log("Raw reports from MongoDB:", allReports);

      const formatted = (allReports.results || []).map((item, index) => ({
        key: item._id ? item._id.toString() : `row-${index}`,
        title: item.title || "N/A",
        keyItem: item.keyItem || "N/A",
        itemBrand: item.itemBrand || "N/A",
        location: item.location || "N/A",
        dateReported: item.dateReported || "N/A",
        reportType: item.reportType || "N/A",
        status: item.status || "N/A",
      }));
      console.log("Found Count: ", allReports.countFound)
      setFoundCounts(allReports.countFound.length || 0);
      setLostCounts(allReports.countLost.length || 0);
      setFound(formatted);
    }

    loadUserData();
  }, []);



  const reportColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Key Item", dataIndex: "keyItem", key: "keyItem" },
    { title: "Brand", dataIndex: "itemBrand", key: "itemBrand" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Date Reported", dataIndex: "dateReported", key: "dateReported" },
    { title: "Type", dataIndex: "reportType", key: "reportType" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Actions"}
  ];

  const claimColumns = [
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Key Item", dataIndex: "keyItem", key: "keyItem" },
    { title: "Brand", dataIndex: "itemBrand", key: "itemBrand" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Date Reported", dataIndex: "dateReported", key: "dateReported" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Actions"}
  ];

  return (
    <>
      <p>Student-ID: {user.studentId || "Unknown"}</p>
      <p>Name: {user.name}</p>
      <p>Email: {user.email || "Unknown"}</p>
      <p>
         
      </p>
    <p>
         Found = {foundCounts}
      </p>
        <p>
         Lost = {lostCounts}
      </p>

      <h2>My Reports</h2>
      <Table dataSource={found} columns={reportColumns} rowKey="key" />

      <h2>My Claim Reports</h2>
      
    </>
  );
}

export default Profile;
