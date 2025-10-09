import React, { useEffect, useState } from "react";
import { Space, Table, Button } from "antd";
import { getAuditLogs } from "../api";

const { Column } = Table;

export const ActivityLog = () => {
  const [data, setData] = useState([]);


  //-----------------------------------DO NOT DELETE-------------------------------
  const fetchData = async () => {
    try {
          const token = sessionStorage.getItem("User"); 
          if (!token) {
            alert("You must be logged in");
            return;
          }
    
     const res = await getAuditLogs(token); 
      if (res && res.results) {
        const formattedData = res.results.map((item, index) => ({
          key: item._id ? item._id.toString() : `row-${index}`,
          _id: item._id ? item._id.toString() : "N/A",
          aid: item.aid || "N/A",
          action: item.action || "N/A",
          targetUser: item.targetUser || "N/A",
          performedBy: item.performedBy || "N/A",
          timestamp: item.timestamp
            ? new Date(item.timestamp).toLocaleString()
            : "N/A",
          ticketId: item.ticketId || "N/A",
          details: item.details || "N/A",
        }));

        setData(formattedData);
        console.log("Formatted data:", formattedData);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //-----------------------------------DO NOT DELETE-------------------------------
  return (
    <>
      <Button onClick={fetchData} style={{ marginBottom: 16 }}>
        Refresh
      </Button>
      <Table dataSource={data}>
        <Column title="Action" dataIndex="action" key="action" />
        <Column title="Performed By" dataIndex="performedBy" key="performedBy" />
        <Column title="Timestamp" dataIndex="timestamp" key="timestamp" />
        <Column title="Details" dataIndex="details" key="details" />
      </Table>
    </>
  );
};
