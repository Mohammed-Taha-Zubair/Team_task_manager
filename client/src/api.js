const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (inMemoryAccessToken) {
    headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(url, config);

  // If 401 and not retried yet, and not auth endpoint itself
  const isAuthEndpoint = endpoint.includes('/auth/login') ||
    endpoint.includes('/auth/register') ||
    endpoint.includes('/auth/refresh');

  if (response.status === 401 && !options._retry && !isAuthEndpoint) {
    options._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return response;
    }

    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken);

        // Retry original request with new access token
        config.headers['Authorization'] = `Bearer ${data.accessToken}`;
        response = await fetch(url, config);
      } else {
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    } catch (err) {
      setAccessToken(null);
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  }

  return response;
};

const api = {
  get: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint, options = {}) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
