import apiClient from './apiClient';

const testimonialService = {
    /**
     * Get testimonials
     * @param {Object} params - Query parameters (e.g., { approved: true, project: id, product: id })
     */
    getTestimonials: (params) => apiClient.get('/testimonials', { params }),

    getTestimonialById: (id) => apiClient.get(`/testimonials/${id}`),

    createTestimonial: (data) => apiClient.post('/testimonials', data),

    updateTestimonial: (id, data) => apiClient.patch(`/testimonials/${id}`, data),

    approveTestimonial: (id, data) => apiClient.patch(`/testimonials/${id}/approve`, data),

    deleteTestimonial: (id) => apiClient.delete(`/testimonials/${id}`),
};

export default testimonialService;
