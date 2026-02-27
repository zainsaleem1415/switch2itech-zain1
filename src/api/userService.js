import apiClient from './apiClient';

const userService = {
    /**
     * Get all users. Can optionally filter by role.
     * @param {string} role - Optional role filter
     */
    getUsers: (role) => {
        const params = role ? { role } : {};
        return apiClient.get('/users', { params });
    },

    /**
     * Get specific user profile
     * @param {string} id - User ID
     */
    getUserById: (id) => apiClient.get(`/users/${id}`),

    /**
     * Update a user's role
     * @param {string} id - User ID
     * @param {string} role - New role
     */
    updateUserRole: (id, role) => apiClient.patch(`/users/${id}`, { role }),
};

export default userService;
