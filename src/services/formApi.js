import { apiRequest } from './apiClient';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const FORM_BASE = BASE + '/form-builder';
const ASSIGN_BASE = BASE + '/form-assignments';

async function request(url, options = {}) {
  return apiRequest(url, options);
}

export async function getMyForms() {
  return request(ASSIGN_BASE + '/my-forms');
}

export async function assignFormToUser(formId, assignedTo, expiresAt) {
  return request(ASSIGN_BASE + '/' + formId + '/assign', {
    method: 'POST',
    body: JSON.stringify({ assignedTo, expiresAt: expiresAt || null }),
  });
}

export async function getFormAssignments(formId) {
  return request(ASSIGN_BASE + '/' + formId + '/assignments');
}

export async function unassignForm(formId, userId) {
  return request(ASSIGN_BASE + '/' + formId + '/assignments/' + userId, { method: 'DELETE' });
}

export async function reviewSubmission(submissionId, status, reviewRemarks) {
  return request(FORM_BASE + '/submissions/' + submissionId + '/review', {
    method: 'PATCH',
    body: JSON.stringify({ status, reviewRemarks: reviewRemarks || null }),
  });
}

export async function listUsersForAssign(search = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  params.set('userType', 'employee');
  params.set('status', 'active');
  params.set('limit', '50');
  return request(BASE + '/users?' + params.toString());
}
