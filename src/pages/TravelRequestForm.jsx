import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createTravelRequest } from "../services/travelRequestApi";
import {
  Card, Form, Input, InputNumber, Select, Button, Space, Row, Col,
  Typography, Alert, Checkbox, Divider
} from "antd";
import { PlusOutlined, CloseOutlined, ArrowLeftOutlined, TeamOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { APP_CONFIG } from "../config";

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function TravelRequestForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [includeFlight, setIncludeFlight] = useState(true);
  const [includeHotel, setIncludeHotel] = useState(false);

  const buildPayload = (values) => {
    const payload = { deviceDetails: { platform: "DESKTOP", version: "1.0.0" } };
    payload.travellerDetails = { paxDetails: values.travellers };
    payload.services = {};
    if (includeFlight) {
      payload.services.FLIGHT = [{
        serviceId: `flight-${Date.now()}`,
        tripType: values.tripType,
        travelClass: values.travelClass,
        paxDetails: { adult: values.flightAdult || 1, child: { count: values.flightChild || 0, age: [] }, infant: values.flightInfant || 0 },
        journeyDetails: [{
          from: { airportCode: values.fromAirport, cityName: values.fromCity, countryCode: APP_CONFIG.COUNTRY_CODE, countryName: '' },
          to: { airportCode: values.toAirport, cityName: values.toCity, countryCode: APP_CONFIG.COUNTRY_CODE, countryName: '' },
          departureDate: values.departureDate ? new Date(values.departureDate).getTime() : 0,
          arrivalDate: values.arrivalDate ? new Date(values.arrivalDate).getTime() : 0,
        }]
      }];
    }
    if (includeHotel) {
      payload.services.HOTEL = [{
        serviceId: `hotel-${Date.now()}`,
        cityCode: values.hotelCityCode,
        cityName: values.hotelCityName,
        countryCode: APP_CONFIG.COUNTRY_CODE,
        checkin: values.checkin ? new Date(values.checkin).getTime() : 0,
        checkout: values.checkout ? new Date(values.checkout).getTime() : 0,
        roomDetailsPaxWise: (values.rooms || [{ adult: 1, childCount: 0, infant: 0 }]).map(r => ({
          adult: parseInt(r.adult) || 1, child: { count: parseInt(r.childCount) || 0, age: [] }, infant: parseInt(r.infant) || 0
        }))
      }];
    }
    payload.reasonForTravel = { reason: values.reason };
    payload.approvalDetails = {
      approvalRequired: true,
      approverDetails: [{ approvalLevel: 1, name: values.approverName, emailId: values.approverEmail }]
    };
    return payload;
  };

  const handleSubmit = async (values) => {
    setError(""); setSuccess("");
    setSaving(true);
    try {
      const payload = buildPayload(values);
      const json = await createTravelRequest({ request_data: payload, remarks: values.remarks || '' });
      setSuccess(`Travel request submitted! Ref: ${json.data?.id?.slice(0, 8) || 'created'}`);
      setTimeout(() => navigate('/travel-requests'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", padding: "30px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30, borderBottom: "1px solid var(--border-color)", paddingBottom: 20 }}>
        <Title level={4} style={{ margin: 0, color: 'var(--text-primary)' }}>âœˆï¸ New Travel Request</Title>
        <Link to="/travel-requests"><Button icon={<ArrowLeftOutlined />}>My Requests</Button></Link>
      </div>
      {success && <Alert message={success} type="success" showIcon closable style={{ marginBottom: 25 }} />}
      {error && <Alert message={error} type="error" showIcon closable style={{ marginBottom: 25 }} />}
      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{
        travellers: [{ name: '', email: '', isPrimaryPax: true }],
        tripType: 'ONEWAY', travelClass: 'ECONOMY', flightAdult: 1, flightChild: 0, flightInfant: 0,
        rooms: [{ adult: 1, childCount: 0, infant: 0 }]
      }}>
        <Row gutter={30}>
          <Col span={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title={<span><TeamOutlined /> Travellers</span>}>
                <Form.List name="travellers">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map(({ key, name, ...rest }, index) => (
                        <Row gutter={8} key={key} align="bottom" style={{ marginBottom: 8 }}>
                          <Col span={10}>
                            <Form.Item {...rest} name={[name, 'name']} label={index === 0 ? 'Name' : ''} rules={[{ required: true }]}>
                              <Input placeholder="Name" />
                            </Form.Item>
                          </Col>
                          <Col span={10}>
                            <Form.Item {...rest} name={[name, 'email']} label={index === 0 ? 'Email' : ''} rules={[{ required: true, type: 'email' }]}>
                              <Input placeholder="Email" />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item {...rest} name={[name, 'isPrimaryPax']} initialValue={index === 0} valuePropName="checked" label={index === 0 ? 'Primary' : ''}>
                              <Checkbox disabled={index === 0} />
                            </Form.Item>
                            {index > 0 && <Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(name)} />}
                          </Col>
                        </Row>
                      ))}
                      <Button type="dashed" onClick={() => add({ isPrimaryPax: false })} icon={<PlusOutlined />} block>Add Traveller</Button>
                    </>
                  )}
                </Form.List>
              </Card>
              <Card title={<Space><span>âœˆï¸ Flight Booking</span><Checkbox checked={includeFlight} onChange={e => setIncludeFlight(e.target.checked)}>Include Flight</Checkbox></Space>}>
                {includeFlight && (
                  <Row gutter={12}>
                    <Col span={12}><Form.Item name="tripType" label="Trip Type"><Select><Select.Option value="ONEWAY">ONEWAY</Select.Option><Select.Option value="ROUND_TRIP">ROUND_TRIP</Select.Option><Select.Option value="MULTICITY">MULTICITY</Select.Option></Select></Form.Item></Col>
                    <Col span={12}><Form.Item name="travelClass" label="Travel Class"><Select><Select.Option value="ECONOMY">ECONOMY</Select.Option><Select.Option value="PREMIUM_ECONOMY">PREMIUM_ECONOMY</Select.Option><Select.Option value="BUSINESS">BUSINESS</Select.Option></Select></Form.Item></Col>
                    <Col span={8}><Form.Item name="flightAdult" label="Adults"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="flightChild" label="Children"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={8}><Form.Item name="flightInfant" label="Infants"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                    <Col span={12}><Form.Item name="fromAirport" label="From Airport Code"><Input placeholder="BLR" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="fromCity" label="From City"><Input placeholder="Bangalore" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="toAirport" label="To Airport Code"><Input placeholder="HYD" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="toCity" label="To City"><Input placeholder="Hyderabad" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="departureDate" label="Departure"><Input type="datetime-local" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="arrivalDate" label="Arrival"><Input type="datetime-local" /></Form.Item></Col>
                  </Row>
                )}
              </Card>
              <Card title={<Space><span>ðŸ¨ Hotel Booking</span><Checkbox checked={includeHotel} onChange={e => setIncludeHotel(e.target.checked)}>Include Hotel</Checkbox></Space>}>
                {includeHotel && (
                  <Row gutter={12}>
                    <Col span={12}><Form.Item name="hotelCityCode" label="City Code"><Input placeholder="CTBLR" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="hotelCityName" label="City Name"><Input placeholder="Bengaluru" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="checkin" label="Check-in"><Input type="datetime-local" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="checkout" label="Check-out"><Input type="datetime-local" /></Form.Item></Col>
                    <Col span={24}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>Rooms</Text>
                      <Form.List name="rooms">
                        {(fields, { add, remove }) => (
                          <>
                            {fields.map(({ key, name, ...rest }, index) => (
                              <Row gutter={8} key={key} align="bottom" style={{ marginBottom: 8 }}>
                                <Col span={7}><Form.Item {...rest} name={[name, 'adult']} label={index === 0 ? 'Adults' : ''} initialValue={1}><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                                <Col span={7}><Form.Item {...rest} name={[name, 'childCount']} label={index === 0 ? 'Children' : ''} initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                                <Col span={7}><Form.Item {...rest} name={[name, 'infant']} label={index === 0 ? 'Infants' : ''} initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
                                <Col span={3}>{index > 0 && <Button type="text" danger icon={<CloseOutlined />} onClick={() => remove(name)} />}</Col>
                              </Row>
                            ))}
                            <Button type="dashed" onClick={() => add({ adult: 1, childCount: 0, infant: 0 })} icon={<PlusOutlined />} block>Add Room</Button>
                          </>
                        )}
                      </Form.List>
                    </Col>
                  </Row>
                )}
              </Card>
            </Space>
          </Col>
          <Col span={12}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card title="ðŸ“ Purpose & Remarks">
                <Form.Item name="reason" label="Reason for Travel" rules={[{ required: true }]}>
                  <TextArea rows={3} placeholder="e.g., Sales visit, urgent meeting, offsite training" />
                </Form.Item>
                <Form.Item name="remarks" label="Additional Remarks">
                  <TextArea rows={3} placeholder="e.g., Need window seat, prefer morning flights, carrying extra luggage" />
                </Form.Item>
                <Text type="secondary" style={{ fontSize: 11 }}>Optional: Add any special instructions or notes for the admin</Text>
              </Card>
              <Card title={<span><CheckCircleOutlined /> Approver Details</span>}>
                <Form.Item name="approverName" label="Approver Name" rules={[{ required: true }]}>
                  <Input placeholder="Manager name" />
                </Form.Item>
                <Form.Item name="approverEmail" label="Approver Email" rules={[{ required: true, type: 'email' }]}>
                  <Input placeholder="manager@company.com" />
                </Form.Item>
              </Card>
              <Button type="primary" htmlType="submit" loading={saving} size="large" block
                icon={<PlusOutlined />} style={{ height: 48, fontSize: 16 }}>
                {saving ? "Submitting..." : "âœˆï¸ Submit Travel Request"}
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
