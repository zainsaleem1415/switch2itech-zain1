import apiClient from './apiClient';

const productService = {
    getAllProducts: () => apiClient.get('/products'),
    getProductById: (id) => apiClient.get(`/products/${id}`),
    createProduct: (data) => apiClient.post('/products', data), // expects FormData
    updateProduct: (id, data) => apiClient.put(`/products/${id}`, data),
    deleteProduct: (id) => apiClient.delete(`/products/${id}`),

    // FAQs
    addProductFaq: (productId, data) => apiClient.post(`/products/${productId}/faqs`, data),
    updateProductFaq: (productId, faqId, data) => apiClient.patch(`/products/${productId}/faqs/${faqId}`, data),
    deleteProductFaq: (productId, faqId) => apiClient.delete(`/products/${productId}/faqs/${faqId}`),
};

export default productService;
