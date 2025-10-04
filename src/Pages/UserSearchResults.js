import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Empty, Spin, message } from "antd";
import { SearchResultCardModal } from '../components/SearchResultCardModal';

export function UserSearchResults() {
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
          "http://localhost:3110/cli/similar-items",
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

  if (!selectedItem) {
    return <Empty description="No selected item" style={{ marginTop: 100 }} />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Recommended Items</h1>
      {loading ? (
        <Spin size="large" />
      ) : recommendations.length === 0 ? (
        <Empty description="No similar items found" />
      ) : (
        <Row gutter={[16, 16]}>
          {recommendations.map((item) => (
            <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
              <SearchResultCardModal item={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
