import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { getClaimReport, getFoundReport, getLostReport } from "../api";
import { Table } from "antd";
import axios from "axios";

export function Profile() {
  const [found, setFound] = useState([]);
  const [claim, setClaim] = useState([]);
  const [lost, setLost] = useState([]);
  const [user, setUser] = useState({});

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");

      if (!token) return;

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const decodedUser = jwtDecode(token);
      setUser(decodedUser);
      console.log("Decoded User:", decodedUser);

      // Fetch reports
      const Found = await getFoundReport();
      const Claim = await getClaimReport();
      const Lost = await getLostReport();

      const formatData = (response) =>
        response?.results?.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          tid: item.tid || "N/A",
          title: item.title || "N/A",
          keyItem: item.keyItem || "N/A",
          itemBrand: item.itemBrand || "N/A",
          description: item.description || "N/A",
          status: item.status || "N/A",
          reportType: item.reportType || "N/A",
          approvedBy: item.approvedBy || "N/A",
          location: item.location || "N/A",
          dateReported: item.dateReported || "N/A",
          startDate: item.startDate || "N/A",
          endDate: item.endDate || "N/A",
          updatedAt: item.updatedAt || "N/A",
          reportedBy: item.reportedBy || "N/A",
        })) || [];

      // Filter reports by logged-in user
      const filterUserReports = (data) =>
        data.filter(
          (item) =>
            item.reportedBy === decodedUser.email ||
            item.reportedBy === decodedUser.studentId
        );

      setFound(filterUserReports(formatData(Found)));
      setClaim(filterUserReports(formatData(Claim)));
      setLost(filterUserReports(formatData(Lost)));
    }

    loadUserData();
  }, []);

  const columns = [
    { title: "Transaction ID", dataIndex: "tid", key: "tid" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Key Item", dataIndex: "keyItem", key: "keyItem" },
    { title: "Brand", dataIndex: "itemBrand", key: "itemBrand" },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Type", dataIndex: "reportType", key: "reportType" },
    { title: "Approved By", dataIndex: "approvedBy", key: "approvedBy" },
    { title: "Location", dataIndex: "location", key: "location" },
    { title: "Date Reported", dataIndex: "dateReported", key: "dateReported" },
    { title: "Start", dataIndex: "startDate", key: "startDate" },
    { title: "End", dataIndex: "endDate", key: "endDate" },
    { title: "Updated", dataIndex: "updatedAt", key: "updatedAt" },
  ];

  return (
    <>
      <p>Student-ID: {user.studentId || "Unknown"}</p>
      <p>Name: {user.name} </p>
      <p>Email: {user.email || "Unknown"}</p>
      <p>
        Claim = {claim.length}, Found = {found.length}, Missing = {lost.length}
      </p>

      <h2>My Found Reports</h2>
      <Table dataSource={found} columns={columns} rowKey="key" />

      <h2>My Claim Reports</h2>
      <Table dataSource={claim} columns={columns} rowKey="key" />

      <h2>My Lost Reports</h2>
      <Table dataSource={lost} columns={columns} rowKey="key" />
    </>
  );
}

export default Profile;
