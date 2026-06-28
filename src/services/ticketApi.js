import { apiRequest } from './apiClient';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const TICKETS_BASE = BASE + '/tickets';

async function request(url, options = {}) {
  return apiRequest(url, options);
}

export async function listTickets(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  const q = qs.toString();
  return request(TICKETS_BASE + '/' + (q ? '?' + q : ''));
}

export async function getTicket(id) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(id));
}

export async function createTicket(data) {
  return request(TICKETS_BASE, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTicket(id, data) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(id), { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTicket(id) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(id), { method: 'DELETE' });
}

export async function getTicketStats() {
  return request(TICKETS_BASE + '/stats');
}

export async function addReply(ticketId, data) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(ticketId) + '/replies', { method: 'POST', body: JSON.stringify(data) });
}

export async function deleteReply(ticketId, replyId) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(ticketId) + '/replies/' + encodeURIComponent(replyId), { method: 'DELETE' });
}

export async function listShares(ticketId) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(ticketId) + '/shares');
}

export async function shareTicket(ticketId, data) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(ticketId) + '/shares', { method: 'POST', body: JSON.stringify(data) });
}

export async function unshareTicket(ticketId, userId) {
  return request(TICKETS_BASE + '/' + encodeURIComponent(ticketId) + '/shares/' + encodeURIComponent(userId), { method: 'DELETE' });
}

export async function searchUsersForShare(search = '') {
  return request(TICKETS_BASE + '/users/search?search=' + encodeURIComponent(search));
}
