// src/Pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import { Card, message, Statistic, Divider, Typography, Spin } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import "./styles/AdminDashboard.css";

import {
  SearchOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  RollbackOutlined,
  PercentageOutlined,
  EnvironmentOutlined,
  KeyOutlined,
  PieChartOutlined,
} from "@ant-design/icons";


export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("User");

  useEffect(() => {
    if (token) {
      try { setUser(jwtDecode(token)); } catch (_) {}
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchDashboardData();
    }
    
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3110/main/dashboard");
      if (res.data?.success) setData(res.data);
      else message.error("Failed to fetch dashboard data.");
    } catch (err) {
      console.error(err);
      message.error("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Spin size="large" tip="Loading dashboard..." />
    </div>
  );

  if (!data) return <p style={{ textAlign: "center" }}>Failed to load dashboard data.</p>;

  
  const { statusCounts, ratios, weeklyReport, pieChart, mostCommon } = data;
  const COLORS = ["#1890ff", "#ff4d4f"];
  const TitleWithIcon = ({ icon: Icon, text }) => (
    <span className="stat-title">
      <Icon className="stat-title-icon" />
      <span>{text}</span>
    </span>
  );





return (
  <>





    <h1 className="h1nigga">FOUNDHUB DASHBOARD</h1>
    <Divider />





    <div className="card-container">

      
      <h2 className="overview-admin">SUMMARY</h2>
      <div className="summary-row">
        <Card
          title={<TitleWithIcon icon={SearchOutlined} text="Review Summary" />}
          className="summary-card"
        >
          <div className="stat-grid">
            <Statistic title="Found Reports" value={statusCounts?.reviewFoundCount} />
            <Statistic title="Lost Reports" value={statusCounts?.reviewLostCount} />
            <Statistic title="Claims" value={statusCounts?.reviewClaimsCount} />
          </div>
        </Card>

        <Card
          title={<TitleWithIcon icon={FolderOpenOutlined} text="Listed Summary" />}
          className="summary-card"
        >
          <div className="stat-grid">
            <Statistic title="Found Reports" value={statusCounts?.listedFoundCount} />
            <Statistic title="Lost Reports" value={statusCounts?.listedLostCount} />
            <Statistic title="Storage" value={statusCounts?.totalStorageCount} />
          </div>
        </Card>

        <Card
          title={<TitleWithIcon icon={CheckCircleOutlined} text="Claims Summary" />}
          className="summary-card"
        >
          <div className="stat-grid">
            <Statistic title="Reviewing" value={statusCounts?.reviewClaimsCount} />
            <Statistic title="Returned" value={statusCounts?.claimReturnedCount} />
          </div>
        </Card>


      </div>






      <Divider />
      <h2 className="overview-admin">OVERVIEW</h2>






      {/* ===== Two-column group: left (2x2) + right (pie) ===== */}
      <div className="dash-2col">


        {/* LEFT SIDE NG OVERVIEW COMPONENT ---------------------------------------------------------------------------------------------- */}
        <div className="dash-left">



          <Card
            title={<TitleWithIcon icon={ClockCircleOutlined} text="Weekly Report (Past 7 Days)" />}
            className="tile-card"
          >


            <div className="stat-grid stat-grid-2">
              <Statistic title="Returned Items" value={weeklyReport?.returnedItems} />
              <Statistic title="Found Items" value={weeklyReport?.receivedFoundItems} />
            </div>
          </Card>

          <Card
            title={<TitleWithIcon icon={PercentageOutlined} text="Lost and Found Ratio" />}
            className="tile-card"
          >
            <div className="stat-grid stat-grid-1">
              <Statistic title="Ratio" value={ratios?.lostToFoundRatio ?? ""} />
            </div>
          </Card>

          <Card
            title={<TitleWithIcon icon={EnvironmentOutlined} text="Most Common Lost Place" />}
            className="tile-card"
          >
            <div className="stat-grid stat-grid-1">
              <Statistic title="Place" value={mostCommon?.place ?? "—"} />
            </div>
          </Card>

          <Card
            title={<TitleWithIcon icon={KeyOutlined} text="Most Common Item Lost" />}
            className="tile-card"
          >
            <div className="stat-grid stat-grid-1">
              <Statistic title="Key Item" value={mostCommon?.keyItem ?? "—"} />
            </div>


          </Card>
        </div>

        {/* RIGHT SIDE NG OVERVIEW COMPONENT ---------------------------------------------------------------------------------------------- */}
        <div className="dash-right">



          <Card
            title={<TitleWithIcon icon={PieChartOutlined} text="Listed Reports Distribution" />}
            className="fill-card tile-card"
          >
            <div className="pie-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChart || []}
                    cx="50%" cy="45%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius="70%"
                    dataKey="value"
                  >
                    {(pieChart || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS[0] : COLORS[1]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>



      </div> {/* END NG DASH COL 2 ---------------------------------------------------------------------------------------------- */}
    </div> {/* END NG card-container ---------------------------------------------------------------------------------------------- */}
  </>
);

};

export default AdminDashboard;
