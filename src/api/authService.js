import apiClient from './apiClient';

const authService = {
    /**
     * Register a new user
     * @param {Object} data 
     */
    register: (data) => apiClient.post('/auth/register', data),

    /**
     * Login user
     * @param {Object} data 
     */
    login: (data) => apiClient.post('/auth/login', data),

    /**
     * Logout user
     */
    logout: () => apiClient.post('/auth/logout'),

    /**
     * Get current authenticated user details
     */
    getCurrentUser: () => apiClient.get('/auth/me'),
};

export default authService;
