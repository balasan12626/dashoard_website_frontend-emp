let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const AUTH_BASE = BASE + '/employee';
const USERS_BASE = BASE + '/users';

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = 'Bearer ' + accessToken;
  return headers;
}

async function request(url, options = {}) {
  const config = { headers: getAuthHeaders(), ...options };
  const res = await fetch(url, config);
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function loginApi(email, password) {
  const res = await fetch(AUTH_BASE + '/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Login failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function registerApi(data) {
  const res = await fetch(AUTH_BASE + '/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Registration failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function logoutApi() {
  const res = await fetch(AUTH_BASE + '/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Logout failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function refreshAccessTokenApi(signal) {
  const res = await fetch(AUTH_BASE + '/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    signal,
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Token refresh failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

export async function forgotPasswordApi(email) {
  return request(AUTH_BASE + '/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPasswordApi(token, email, newPassword) {
  return request(AUTH_BASE + '/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, email, newPassword }),
  });
}

export async function verifyEmailApi(token, email) {
  return request(AUTH_BASE + '/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token, email }),
  });
}

export async function changePasswordApi(currentPassword, newPassword) {
  return request(AUTH_BASE + '/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
