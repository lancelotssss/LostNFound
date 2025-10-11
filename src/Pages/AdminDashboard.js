import React, { useEffect, useState } from "react";
import { Card, Row, Col, message } from "antd";
import axios from "axios";
import { jwtDecode } from "jwt-decode";




export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
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
      if (res?.data?.statusCounts) {
        setStats(res.data.statusCounts);
      } else if (res?.data?.counts) {
        setStats(res.data.counts);
      } else {
        message.error("Invalid dashboard data format.");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      message.error("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Failed to load dashboard data.</p>;

  const totalReports = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ marginBottom: 20 }}>📊 Admin Dashboard</h1>
      <p>Welcome, {user ? user.name : "Admin"}!</p>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Lost & Found Summary" bordered>
            <p>• Review Found: {stats.reviewFoundCount}</p>
            <p>• Review Lost: {stats.reviewLostCount}</p>
            <p>• Listed Found: {stats.listedFoundCount}</p>
            <p>• Listed Lost: {stats.listedLostCount}</p>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Claims Summary" bordered>
            <p>• Review Claims: {stats.reviewClaimsCount}</p>
            <p>• Claim Returned: {stats.claimReturnedCount}</p>
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 20 }}>
        <h3>Total Reports: {totalReports}</h3>
      </Card>
    </div>
  );
};

export default AdminDashboard;
