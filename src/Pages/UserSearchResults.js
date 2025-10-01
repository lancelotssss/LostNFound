import { useLocation } from "react-router-dom";
import { Row, Col, Empty } from "antd";
import { SearchResultCardModal } from "../components/SearchResultCardModal";

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
              <SearchResultCardModal item={item} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
