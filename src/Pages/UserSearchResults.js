import { useLocation } from "react-router-dom";
import { Card, Row, Col, Empty } from "antd";

const { Meta } = Card;

export function UserSearchResults() {
  const location = useLocation();
  const results = location.state?.results || [];

  return (
    <div style={{ padding: "20px" }}>
      <h1>Search Results</h1>
      {results.length === 0 ? (
        <Empty description="No items found" />
      ) : (
        <Row gutter={[16, 16]}>
          {results.map((item) => (
            <Col key={item._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{ width: 240 }}
                cover={
                  <img
                    draggable={false}
                    alt={item.keyItem}
                    src={item.photoUrl || "https://via.placeholder.com/240"}
                  />
                }
              >
                <Meta
                  title={item.keyItem}
                  description={
                    <>
                      <p><b>Category:</b> {item.category}</p>
                      <p><b>Brand:</b> {item.itemBrand || "N/A"}</p>
                      <p><b>Location:</b> {item.location}</p>
                      <p><b>Date Found:</b>{" "}
                        {item.dateFound
                          ? new Date(item.dateFound).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}