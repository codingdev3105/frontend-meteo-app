import axios from 'axios';

const API_URL = 'https://backend-meteo-app.vercel.app/api';

// Instance avec Intercepteur pour le Token
const instance = axios.create({
    baseURL: API_URL
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    // Auth
    login: async (username, password) => {
        const response = await instance.post('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
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
        return response.data;
    },
    updatePassword: async (passwordData) => {
        const response = await instance.put('/auth/password', passwordData);
        return response.data;
    },

    // Stations
    getAllStations: async () => {
        const response = await instance.get('/stations/all');
        return response.data;
    },
    getUserStations: async () => {
        const response = await instance.get('/stations');
        return response.data;
    },
    registerStation: async (hardwareId, name) => {
        const response = await instance.post('/stations/register', { hardwareId, name });
        return response.data;
    },
    getStationByHardwareId: async (hardwareId) => {
        const response = await instance.get(`/stations/${hardwareId}`);
        return response.data;
    },
    updateStation: async (id, data) => {
        const response = await instance.put(`/stations/${id}`, data);
        return response.data;
    },
    deleteStation: async (id) => {
        const response = await instance.delete(`/stations/${id}`);
        return response.data;
    },
    getNodeDetails: async (nodeId) => {
        const response = await instance.get(`/stations/node/${nodeId}`);
        return response.data;
    },

    // Data / Monitoring
    getStationLatestMeasure: async (hardwareId) => {
        const response = await instance.get(`/data/latest/${hardwareId}`);
        return response.data;
    },
    getStationStatus: async (hardwareId) => {
        const response = await instance.get(`/data/status/${hardwareId}`);
        return response.data;
    },
    getStationHistory: async (hardwareId, days = 1) => {
        const response = await instance.get(`/data/history/${hardwareId}?days=${days}`);
        return response.data;
    },

    // Alerts
    getAlertConfigs: async () => {
        const response = await instance.get('/alerts');
        return response.data;
    },
    createAlertConfig: async (data) => {
        const response = await instance.post('/alerts', data);
        return response.data;
    },
    deleteAlertConfig: async (id) => {
        const response = await instance.delete(`/alerts/${id}`);
        return response.data;
    },
    getUnseenAlerts: async () => {
        const response = await instance.get('/alerts/unseen');
        return response.data;
    },
    markAllAlertsSeen: async () => {
        const response = await instance.post('/alerts/mark-all-seen');
        return response.data;
    },
    markAlertAsSeen: async (alertId) => {
        const response = await instance.post('/alerts/mark-seen', { alertId });
        return response.data;
    },
    getAlertLogs: async () => {
        const response = await instance.get('/alerts/logs');
        return response.data;
    },
    toggleAlertStatus: async (id) => {
        const response = await instance.patch(`/alerts/${id}/toggle`);
        return response.data;
    },
    getAdminStats: async () => {
        const response = await instance.get('/admin/stats');
        return response.data;
    },
    getHealth: async () => {
        const response = await instance.get('/health');
        return response.data;
    },
    getAllUsers: async () => {
        const response = await instance.get('/auth/users');
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await instance.put(`/auth/users/${id}`, data);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await instance.delete(`/auth/users/${id}`);
        return response.data;
    },
    // Catalogue Capteurs
    getSensorsCatalogue: async () => {
        const response = await instance.get('/sensors');
        return response.data;
    },
    addSensorToCatalogue: async (data) => {
        const response = await instance.post('/sensors', data);
        return response.data;
    },
    updateSensorCatalogue: async (id, data) => {
        const response = await instance.put(`/sensors/${id}`, data);
        return response.data;
    },
    deleteSensorFromCatalogue: async (id) => {
        const response = await instance.delete(`/sensors/${id}`);
        return response.data;
    },
    getSystemLogs: async (type = 'ALL', date = '') => {
        const response = await instance.get(`/data/logs?type=${type}&date=${date}`);
        return response.data;
    },
    getLogTypes: async () => {
        const response = await instance.get('/data/logs/types');
        return response.data;
    },
    markSystemLogsSeen: async () => {
        const response = await instance.post('/data/logs/mark-seen');
        return response.data;
    },

    // --- DOCUMENTATION ---
    getDocs: async () => {
        const response = await instance.get('/docs');
        return response.data;
    },
    saveDocSection: async (sectionData) => {
        const response = await instance.post('/docs/save', sectionData);
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
