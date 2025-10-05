import axios from 'axios';

const baseURL = import.meta.env.VITE_AI_SERVICE_URL;

const aiClient = axios.create({
  baseURL,
  timeout: 15000
});

aiClient.interceptors.request.use((config) => {
  if (!baseURL) {
    throw new Error('VITE_AI_SERVICE_URL is not configured');
  }
  return config;
});

export default aiClient;
