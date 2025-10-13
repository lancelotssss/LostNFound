// src/Pages/AdminSearchResult.js
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Empty,
  Spin,
  message,
  Button,
  Typography,
  Grid,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { SearchResultCardModal } from "../components/SearchResultCardModal";
import "./styles/UserSearchResults.css";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;


function parseTitle(title) {
  if (!title) return { category: "N/A", type: "N/A", name: "N/A" };

  const cleaned = title.replace(/^Found Item:\s*|^Lost Item:\s*/i, "").trim();

  const parts = cleaned.split(":").map(p => p.trim());
  let category = parts[0] || "";
  let type = "";
  let name = "";

  if (parts[1]) {
    const subParts = parts[1].split(",").map(p => p.trim());
    type = subParts[0] || "";
    name = subParts[1] || "";
  }

  return { category, type, name };
}

export function AdminSearchResults() {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const navigate = useNavigate();
  const location = useLocation();
  const selectedItem = location.state?.selectedItem;

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedItem) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("User");
        if (!token) {
          message.error("You must be logged in to view recommendations.");
          setLoading(false);
          return;
        }

        let startDate = null;
        let endDate = null;

        

        if (selectedItem.dateFound) {
          const date = new Date(selectedItem.dateFound);
          if (!isNaN(date)) {
            startDate = date.toISOString();
            endDate = date.toISOString();
          }
        }
    
        const response = await axios.post(
          "http://localhost:3110/main/similar-items",
          {
            selectedItemId: selectedItem._id,
            category: selectedItem.category,
            keyItem: selectedItem.keyItem || "",
            location: selectedItem.location || "",
            startDate,
            endDate,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setRecommendations(response.data.similarFound || []);
      } catch (error) {
        console.error("Error fetching recommended items:", error);
        message.error("Failed to load similar items.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedItem]);

  // after successful claim, item is removed
  const handleClaimSuccess = (claimedId) => {
    setRecommendations((prev) => prev.filter((item) => item._id !== claimedId));
  };

  if (!selectedItem) {
    return <Empty description="No selected item" style={{ marginTop: 100 }} />;
  }

  return (
    <div className="usr-container">

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="usr-back-btn"
        >
          Back to Home
        </Button>
      <div className="usr-header">

        <div className="usr-header-texts">
          <Title level={3} className="usr-title">
            Recommended Items
          </Title>
        {(() => {
          const { category, type, name } = parseTitle(selectedItem?.title);
          return (
            <Text type="secondary" className="usr-subtitle">
              Based on your lost report:{" "}
              <strong>
                {category} › {type} › {name}
              </strong>
            </Text>
          );
        })()}

        </div>
      </div>

      {loading ? (
        <div className="usr-center">
          <Spin size="large" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="usr-center">
          <Empty description="No similar items found" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {recommendations.map((item) => (
            <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
              <SearchResultCardModal
                item={item}
                lostId={selectedItem._id}          // pass the lost report id
                onClaimSuccess={handleClaimSuccess} // remove from list on success
              />
            </Col>
          ))}
        </Row>
      )}
    </div>

    
  );
}

export default AdminSearchResults;
