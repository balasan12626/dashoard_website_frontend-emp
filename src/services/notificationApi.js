import { apiRequest } from './apiClient';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const API_BASE = BASE + '/notifications';

async function request(url, options = {}) {
  return apiRequest(url, options);
}

export async function listNotifications(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const queryStr = qs.toString();
  return request(API_BASE + '/' + (queryStr ? '?' + queryStr : ''));
}

export async function markNotificationRead(id) {
  return request(API_BASE + '/' + encodeURIComponent(id) + '/read', { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return request(API_BASE + '/read-all', { method: 'PATCH' });
}

export async function deleteNotification(id) {
  return request(API_BASE + '/' + encodeURIComponent(id), { method: 'DELETE' });
}
