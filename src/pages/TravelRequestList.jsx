import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { listTravelRequests } from "../services/travelRequestApi";
import { Card, Tag, Skeleton, Typography, Space, Button, Empty, List, Alert } from "antd";
import { PlusOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Text } = Typography;

const statusConfig = {
  pending: { color: 'warning' },
  approved: { color: 'processing' },
  submitted: { color: 'success' },
  rejected: { color: 'error' },
};

export default function TravelRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const json = await listTravelRequests();
        setRequests(json.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>âœˆï¸ My Travel Requests</h1>
          <Text type="secondary" style={{ fontSize: 13 }}>Track and manage your travel bookings</Text>
        </div>
        <Link to="/travel-requests/new">
          <Button type="primary" icon={<PlusOutlined />}>New Request</Button>
        </Link>
      </div>
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 25 }} />}
      {loading ? (
        <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>
      ) : requests.length === 0 ? (
        <Card>
          <Empty description="No travel requests yet">
            <Link to="/travel-requests/new"><Button type="primary" icon={<PlusOutlined />}>Create your first request</Button></Link>
          </Empty>
        </Card>
      ) : (
        <List
          dataSource={requests}
          renderItem={r => (
            <List.Item style={{ display: 'block', padding: 0, marginBottom: 16 }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <Space size={10} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700 }}>{r.employee_name}</span>
                      <Tag color={statusConfig[r.status]?.color}>{r.status.toUpperCase()}</Tag>
                    </Space>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      Created: {new Date(r.created_at).toLocaleString()}
                      {r.reviewed_at && ` • Reviewed: ${new Date(r.reviewed_at).toLocaleString()}`}
                    </div>
                    {r.remarks && (
                      <Alert message={r.remarks} type="warning" showIcon style={{ marginTop: 8, padding: '8px 12px' }} />
                    )}
                    {r.request_data?.reasonForTravel?.reason && (
                      <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-secondary)" }}>
                        Purpose: {r.request_data?.reasonForTravel?.reason}
                      </div>
                    )}
                  </div>
                  <Space size={8}>
                    {r.travel_request_url && (
                      <a href={r.travel_request_url} target="_blank" rel="noopener noreferrer">
                        <Button size="small" type="primary" ghost icon={<ArrowRightOutlined />}>View on myBiz</Button>
                      </a>
                    )}
                    {r.trf_id && (
                      <Tag>TRF: {r.trf_id}</Tag>
                    )}
                  </Space>
                </div>
                {r.request_data?.services && (
                  <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {r.request_data.services.FLIGHT?.map((f, i) => (
                      <Text key={i} type="secondary" style={{ fontSize: 12 }}>
                        âœˆï¸ {f.journeyDetails?.[0]?.from?.airportCode || "?"} → {f.journeyDetails?.[0]?.to?.airportCode || "?"} ({f.travelClass})
                      </Text>
                    ))}
                    {r.request_data.services.HOTEL?.map((h, i) => (
                      <Text key={i} type="secondary" style={{ fontSize: 12 }}>
                        ðŸ¨ {h.cityName || h.cityCode || "?"}
                      </Text>
                    ))}
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
}
