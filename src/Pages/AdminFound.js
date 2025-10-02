import React, { useEffect, useState } from "react";
import { Table, Button } from "antd";
import { getFoundReport } from "../api";

const { Column } = Table;

export const AdminFound = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("User"); 
      if (!token) {
        alert("You must be logged in");
        return;
      }

      const res = await getFoundReport(token); 
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          tid: item.tid || "N/A",
          title: item.title || "N/A",
          keyItem: item.keyItem || "N/A",
          itemBrand: item.itemBrand || "N/A",
          description: item.description || "N/A",
          status: item.status || "N/A",
          reportType: item.reportType || "N/A",
          reportedBy: item.reportedBy || "N/A",
          approvedBy: item.approvedBy || "N/A",
          location: item.location || "N/A",
          dateReported: item.dateReported
            ? new Date(item.dateReported).toLocaleString()
            : "N/A",
          startDate: item.startDate ? new Date(item.startDate).toLocaleDateString() : "N/A",
          endDate: item.endDate ? new Date(item.endDate).toLocaleDateString() : "N/A",
          photoUrl: item.photoUrl || null,
          updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A",
        }));

        setData(formattedData);
        console.log("Formatted data:", formattedData);
      }
    } catch (err) {
      console.error("Error fetching found items:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table dataSource={data}>
        <Column title="TID" dataIndex="tid" key="tid" />
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Key Item" dataIndex="keyItem" key="keyItem" />
        <Column title="Brand" dataIndex="itemBrand" key="itemBrand" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Start Date" dataIndex="startDate" key="startDate" />
        <Column title="End Date" dataIndex="endDate" key="endDate" />
      </Table>
    </>
  );
};
