import { apiRequest } from './apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const BASE = API_BASE + '/travel-requests';

async function request(url, options = {}) {
  return apiRequest(url, options);
}

export async function createTravelRequest(data) {
  return request(BASE, { method: 'POST', body: JSON.stringify(data) });
}

export async function listTravelRequests(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const q = qs.toString();
  return request(BASE + '/' + (q ? '?' + q : ''));
}

export async function getTravelRequest(id) {
  return request(BASE + '/' + encodeURIComponent(id));
}

export async function listPendingTravelRequests() {
  return request(BASE + '/pending');
}

export async function approveTravelRequest(id, admin_remarks = '') {
  return request(BASE + '/' + encodeURIComponent(id) + '/approve', { method: 'PATCH', body: JSON.stringify({ admin_remarks }) });
}

export async function rejectTravelRequest(id, admin_remarks = '') {
  return request(BASE + '/' + encodeURIComponent(id) + '/reject', { method: 'PATCH', body: JSON.stringify({ admin_remarks }) });
}
