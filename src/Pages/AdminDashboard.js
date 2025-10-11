import React, { useEffect, useState } from "react";
import { Card, Row, Col, message, Statistic, Divider, Typography, Spin } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const { Title } = Typography;

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = sessionStorage.getItem("User");

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchDashboardData();
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3110/main/dashboard");
      console.log("Dashboard response:", res.data);
      if (res.data.success) {
        setData(res.data);
      } else {
        message.error("Failed to fetch dashboard data.");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      message.error("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" tip="Loading dashboard..." />
      </div>
    );

  if (!data)
    return <p style={{ textAlign: "center" }}>Failed to load dashboard data.</p>;

  const { statusCounts, ratios, mostCommon, weeklyReport, pieChart, totalReports } = data;

  const COLORS = ["#1890ff", "#ff4d4f"]; // blue = Found, red = Lost

  return (
    <div style={{ padding: 30 }}>
      <Title level={2}>📊 Admin Dashboard</Title>
      <p>Welcome, {user ? user.name : "Admin"}!</p>

      {/* Top Row: Review & Listed Summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="🟠 Review Summary" bordered>
            <p>• Found Reports: {statusCounts.reviewFoundCount}</p>
            <p>• Lost Reports: {statusCounts.reviewLostCount}</p>
            <p>• Claims: {statusCounts.reviewClaimsCount}</p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title="🟢 Listed Summary" bordered>
            <p>• Found Reports: {statusCounts.listedFoundCount}</p>
            <p>• Lost Reports: {statusCounts.listedLostCount}</p>
            <p>• Storage (All Listed): {statusCounts.totalStorageCount}</p>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card title="📦 Claims Summary" bordered>
            <p>• Reviewing: {statusCounts.reviewClaimsCount}</p>
            <p>• Returned: {statusCounts.claimReturnedCount}</p>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Ratio + Most Common Info */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card title="⚖️ Lost : Found Ratio" bordered>
            <Statistic value={ratios.lostToFoundRatio} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="📍 Most Common Lost Place" bordered>
            <Statistic value={mostCommon.place} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={8}>
          <Card title="🔑 Most Common Key Item Lost" bordered>
            <Statistic value={mostCommon.keyItem} />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Weekly Report */}
      <Card title="📅 Weekly Report (Past 7 Days)" bordered style={{ marginBottom: 20 }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Statistic title="Returned Items" value={weeklyReport.returnedItems} />
          </Col>
          <Col span={12}>
            <Statistic title="Received Found Items" value={weeklyReport.receivedFoundItems} />
          </Col>
        </Row>
      </Card>

      {/* Pie Chart */}
      <Card title="🥧 Listed Reports Distribution" bordered style={{ marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChart}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              dataKey="value"
            >
              {pieChart.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Total Reports */}
      <Card>
        <Statistic title="📋 Total Reports" value={totalReports} />
      </Card>
    </div>
  );
};

export default AdminDashboard;
