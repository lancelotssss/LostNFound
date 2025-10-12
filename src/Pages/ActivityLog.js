import { useEffect, useState } from "react";
import { Space, Table, Button, Select, Input } from "antd";
import { getAuditLogs } from "../api";
import "./styles/ant-input.css";
import "./styles/AdminHistory.css";
import { ReloadOutlined, SyncOutlined } from "@ant-design/icons";

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





    
    <div className="table-controls">





      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- LEFT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <div className="panel panel--filters">
        <div className="panel-title">Search Filters</div>
        <div className="panel-body">
          <Select
            placeholder="Filter by Action"
            allowClear
            value={selectedAction || undefined}
            onChange={(value) => setSelectedAction(value || "")}
            options={actionOptions.map((action) => ({
              label: action,
              value: action,
            }))}

            style={{ flex: "0 0 240px", minWidth: 200 }}
          />

          <Search
            className="poppins-input"
            placeholder="Search Performed By"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}

            style={{ flex: "1 1 320px", minWidth: 240 }}
          />
        </div>
      </div>






      {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- RIGHT SIDE 'TO =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
      <div className="panel panel--actions">
        <div className="panel-title">Actions</div>
        <div className="panel-body panel-actions-row">
          <div style={{ marginRight: "auto" }} />
          <Button
            onClick={() => {
              setSelectedAction("");
              setSearchText("");
              fetchData();
            }}
            className="btn-with-icons"
          >
            <ReloadOutlined />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
    </div>






    {/* =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- LEFTTABLE =-=-=-==-=-=-=-=-=-=-=-=-==-=-=-=-=-=- */}
    <Table
      dataSource={filteredData}
      pagination={{ pageSize: 8 }}
      rowKey="key"
    >
      <Column title="ACTION" dataIndex="action" key="action" />
      <Column title="PERFORMED BY" dataIndex="performedBy" key="performedBy" />
      <Column title="TIME" dataIndex="timestamp" key="timestamp" />
      <Column title="DETAILS" dataIndex="details" key="details" />
    </Table>
  </>
);





};
