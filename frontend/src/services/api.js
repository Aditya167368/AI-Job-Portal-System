import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const openAiKey = localStorage.getItem('user_openai_key');
  if (openAiKey) {
    config.headers['X-OpenAI-Key'] = openAiKey;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on a protected action, token might be expired
      console.warn('Session unauthorized or token expired.');
    }
    return Promise.reject(error);
  }
);

export default api;
