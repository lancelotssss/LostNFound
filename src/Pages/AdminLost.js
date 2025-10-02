import React, { useEffect, useState } from "react";
import { Space, Table, Button } from "antd";
import { getLostReport } from "../api";

const { Column } = Table;

export const AdminLost = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
          const token = sessionStorage.getItem("User"); 
          if (!token) {
            alert("You must be logged in");
            return;
          }
    
          const res = await getLostReport(token); 
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
        dateReported: item.dateReported || "N/A",
        startDate: item.startDate || "N/A",
        endDate: item.endDate || "N/A",
        photoUrl: item.photoUrl || null,
        updatedAt: item.updatedAt || "N/A",
        }));

        setData(formattedData);
        console.log("Formatted data:", formattedData);
      }
    } catch (err) {
      console.error("Error fetching lost items:", err);
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
        <Column title="Description" dataIndex="description" key="description" />
        <Column title="Status" dataIndex="status" key="status" />
        <Column title="Report Type" dataIndex="reportType" key="reportType" />
        <Column title="Reported By" dataIndex="reportedBy" key="reportedBy" />
        <Column title="Approved By" dataIndex="approvedBy" key="approvedBy" />
        <Column title="Location" dataIndex="location" key="location" />
        <Column title="Date Reported" dataIndex="dateReported" key="dateReported" />
        <Column title="Start Date" dataIndex="startDate" key="startDate" />
        <Column title="End Date" dataIndex="endDate" key="endDate" />
        <Column
          title="Photo"
          dataIndex="photoUrl"
          key="photoUrl"
          render={(url) =>
            url ? <img src={url} alt="item" style={{ width: 80 }} /> : "No photo"
          }
        />
        <Column title="Updated At" dataIndex="updatedAt" key="updatedAt" />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <a>Edit</a>
              <a>Delete</a>
            </Space>
          )}
        />
      </Table>
    </>
  );
};
