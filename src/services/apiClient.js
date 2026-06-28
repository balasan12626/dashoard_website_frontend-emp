import { getAccessToken, setAccessToken, refreshAccessTokenApi } from './authApi';

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error); else resolve();
  });
  pendingQueue = [];
}

export async function apiRequest(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getAccessToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const json = await refreshAccessTokenApi();
        const newToken = json.data?.accessToken;
        if (newToken) {
          setAccessToken(newToken);
          headers['Authorization'] = 'Bearer ' + newToken;
          processQueue(null);
        } else {
          processQueue(new Error('Token refresh returned no token'));
        }
      } catch (err) {
        processQueue(err);
        throw err;
      } finally {
        isRefreshing = false;
      }
      res = await fetch(url, { ...options, headers });
    } else {
      await new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      });
      headers['Authorization'] = 'Bearer ' + getAccessToken();
      res = await fetch(url, { ...options, headers });
    }
  }

  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.message || 'Request failed');
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}
