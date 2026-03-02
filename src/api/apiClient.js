import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

export default apiClient;
