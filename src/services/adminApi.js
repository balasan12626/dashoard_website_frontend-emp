import { apiRequest } from './apiClient';

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
const UNLOCK_BASE = BASE + '/unlock-requests';

export async function submitUnlockRequest(email, message = '') {
  return apiRequest(UNLOCK_BASE, {
    method: 'POST',
    body: JSON.stringify({ email, message }),
  });
}
