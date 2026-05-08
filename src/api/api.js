import axios from 'axios';

/**
 * MétéoPro Systems - Real API Service
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: API_URL,
});

// Interceptor to add token to headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Sensor Library (Metadata used for UI)
export const sensorLibrary = {
  t: { name: 'Température', unit: '°C', icon: 'Thermometer', color: '#ef4444' },
  h: { name: 'Humidité', unit: '%', icon: 'Droplets', color: '#0ea5e9' },
  sol: { name: 'Humidité Sol', unit: '%', icon: 'Droplets', color: '#8b5cf6' },
  g: { name: 'Qualité Air', unit: 'ppm', icon: 'Wind', color: '#10b981' },
  lum: { name: 'Luminosité', unit: 'lux', icon: 'Sun', color: '#f59e0b' },
  p: { name: 'Pression', unit: 'hPa', icon: 'Gauge', color: '#6366f1' },
  bat: { name: 'Batterie', unit: 'V', icon: 'Battery', color: '#10b981' },
  w: { name: 'Pluie', unit: 'DÉTECT', icon: 'Activity', color: '#0ea5e9' }
};

export const api = {
  // --- AUTH ---
  login: async (username, password) => {
    const response = await instance.post('/auth/login', { username, password });
    if (response.data.token) {
      const { token, ...userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await instance.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  updateProfile: async (userData) => {
    const response = await instance.put('/auth/profile', userData);
    const userToStore = response.data.user || response.data;
    if (userToStore && userToStore.username) {
      localStorage.setItem('user', JSON.stringify(userToStore));
    }
    return response.data;
  },

  updatePassword: async (newPassword) => {
    const response = await instance.put('/auth/password', { newPassword });
    return response.data;
  },

  // --- STATIONS ---
  getStations: async () => {
    const response = await instance.get('/stations');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await instance.get('/stations/stats');
    return response.data;
  },

  getStationByHardwareId: async (hwId) => {
    const response = await instance.get(`/stations/${hwId}`);
    return response.data;
  },
  
  registerStation: async (stationData) => {
    const response = await instance.post('/stations/register', stationData);
    return response.data;
  },

  updateStation: async (id, stationData) => {
    const response = await instance.put(`/stations/${id}`, stationData);
    return response.data;
  },

  deleteStation: async (id) => {
    const response = await instance.delete(`/stations/${id}`);
    return response.data;
  },

  getStationStatus: async (hwId) => {
    const response = await instance.get(`/data/status/${hwId}`);
    return {
      ...response.data,
      sensorLibrary: {
        ...(response.data.sensorLibrary || {}),
        ...sensorLibrary
      }
    };
  },

  // --- DATA ---
  getHistory: async (stationId, period = '24h') => {
    const response = await instance.get(`/data/history/${stationId}?period=${period}`);
    return response.data;
  },

  // --- ALERTS ---
  getAlerts: async () => {
    const response = await instance.get('/alerts');
    return response.data;
  },

  getAlertLogs: async () => {
    const response = await instance.get('/alerts/logs');
    return response.data;
  },

  markAlertAsSeen: async (alertId) => {
    const response = await instance.post('/alerts/mark-seen', { alertId });
    return response.data;
  },

  markAllAlertsAsSeen: async () => {
    const response = await instance.post('/alerts/mark-all-seen');
    return response.data;
  },

  createAlert: async (alertData) => {
    const response = await instance.post('/alerts', alertData);
    return response.data;
  },

  deleteAlert: async (id) => {
    const response = await instance.delete(`/alerts/${id}`);
    return response.data;
  },

  toggleAlertStatus: async (id) => {
    const response = await instance.patch(`/alerts/${id}/toggle`);
    return response.data;
  },

  getUserLogs: async () => {
    // For users, we use the /data/logs endpoint which filters by owner
    try {
      const response = await instance.get('/data/logs'); 
      return response.data;
    } catch (e) {
      return [];
    }
  },

  markSystemLogsSeen: async () => {
    const response = await instance.post('/data/logs/mark-seen');
    return response.data;
  },

  // --- ADMIN ---
  getUsers: async () => {
    const response = await instance.get('/admin/users');
    return response.data;
  },
  
  adminUpdateUser: async (id, userData) => {
    const response = await instance.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  adminDeleteUser: async (id) => {
    const response = await instance.delete(`/admin/users/${id}`);
    return response.data;
  },

  getLogs: async () => {
    const response = await instance.get('/admin/logs');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await instance.get('/admin/stats');
    return response.data;
  },

  adminGetStations: async () => {
    const response = await instance.get('/stations/all');
    return response.data;
  },

  getNodeDetails: async (nodeId) => {
    const response = await instance.get(`/stations/node/${nodeId}`);
    return response.data;
  },

  // Gestion Bibliothèque Capteurs
  adminGetSensors: async () => {
    const response = await instance.get('/admin/sensors');
    return response.data;
  },

  adminCreateSensor: async (sensorData) => {
    const response = await instance.post('/admin/sensors', sensorData);
    return response.data;
  },

  adminUpdateSensor: async (id, sensorData) => {
    const response = await instance.put(`/admin/sensors/${id}`, sensorData);
    return response.data;
  },

  adminDeleteSensor: async (id) => {
    const response = await instance.delete(`/admin/sensors/${id}`);
    return response.data;
  },

  // --- CONTACT ---
  sendMessage: async (formData) => {
    const response = await instance.post('/contact', formData);
    return response.data;
  },

  getSensors: async () => {
    const response = await instance.get('/sensors');
    return response.data;
  },

  // --- DOCUMENTATION ---
  getDocs: async () => {
    const response = await instance.get('/docs');
    return response.data;
  },

  saveDocSection: async (docData) => {
    const response = await instance.post('/docs/save', docData);
    return response.data;
  },

  deleteDocSection: async (id) => {
    const response = await instance.delete(`/docs/${id}`);
    return response.data;
  },

  uploadDocMedia: async (formData) => {
    const response = await instance.post('/docs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
