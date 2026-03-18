import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

const getSessionToken = (): string | null =>
  localStorage.getItem('session_token');

api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
