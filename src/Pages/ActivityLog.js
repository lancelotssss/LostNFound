import { useEffect, useState } from "react";
import { Space, Table, Button, Select, Input } from "antd";
import { getAuditLogs } from "../api";

const { Column } = Table;
const { Search } = Input;

export const ActivityLog = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedAction, setSelectedAction] = useState("");
  const [searchText, setSearchText] = useState("");

  //-----------------------------------DO NOT DELETE-----------------------------------
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
        setFilteredData(formattedData); 
        console.log("Formatted data:", formattedData);
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //-----------------------------------DO NOT DELETE-----------------------------------
  useEffect(() => {
    // ✅ If no filters, show all data
    if (!selectedAction && !searchText.trim()) {
      setFilteredData(data);
      return;
    }

    let filtered = [...data];

    if (selectedAction) {
      filtered = filtered.filter(
        (item) => item.action.toLowerCase() === selectedAction.toLowerCase()
      );
    }

    if (searchText.trim()) {
      filtered = filtered.filter((item) =>
        item.performedBy.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [selectedAction, searchText, data]);

  //-----------------------------------DO NOT DELETE-----------------------------------
  const actionOptions = [
    "REGISTER",
    "LOGIN",
    "LOGOUT",
    "SUBMIT_LOST",
    "SUBMIT_FOUND",
    "DENY_LOST",
    "DENY_FOUND",
    "APPROVE_LOST",
    "APPROVE_FOUND",
    "SUBMIT_CLAIM",
    "APPROVE_CLAIM",
    "COMPLETE_CLAIM",
    "DENY_CLAIM",
    "UPDATE_USER",
    "ACTIVATE_USER",
    "SUSPEND_USER",
  ];

 return (
    <>
      <Space style={{ marginBottom: 16 }} wrap>
        <Button
          onClick={() => {
            setSelectedAction("");
            setSearchText("");
            fetchData();
          }}
        >
          Refresh
        </Button>

        <Select
          placeholder="Filter by Action"
          allowClear
          style={{ width: 220 }}
          value={selectedAction || undefined}
          onChange={(value) => setSelectedAction(value || "")}
          options={actionOptions.map((action) => ({
            label: action,
            value: action,
          }))}
        />

        <Search
          placeholder="Search Performed By"
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 220 }}
        />
      </Space>

      <Table
        dataSource={filteredData}
        pagination={{ pageSize: 8 }}
        rowKey="key"
      >
        <Column title="Action" dataIndex="action" key="action" />
        <Column title="Performed By" dataIndex="performedBy" key="performedBy" />
        <Column title="Timestamp" dataIndex="timestamp" key="timestamp" />
        <Column title="Details" dataIndex="details" key="details" />
      </Table>
    </>
  );
};
