import apiClient from './apiClient';

const postToFirstAvailable = async (paths, data) => {
    let lastError;
    for (const path of paths) {
        try {
            return await apiClient.post(path, data);
        } catch (error) {
            lastError = error;
            if (error?.response?.status !== 404) {
                throw error;
            }
        }
    }
    throw lastError;
};

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

    /**
     * Verify email code after registration
     * Expects { code }
     */
    verifyEmailCode: (code) => apiClient.post('/auth/verify-email', { code }),

    /**
     * Verify phone code after registration
     * Expects { code }
     */
    verifyPhoneCode: (code) => apiClient.post('/auth/verify-phone', { code }),

    /**
     * Request OTP using identifier (email or phone)
     * Expects { identifier }
     */
    requestOtp: (identifier) => postToFirstAvailable(
        ['/auth/request-otp', '/auth/resend-otp', '/auth/otp/resend', '/auth/send-otp'],
        { identifier }
    ),

    /**
     * Verify OTP login flow
     * Expects { identifier, otp }
     */
    verifyOtpLogin: (data) => postToFirstAvailable(
        ['/auth/verify-otp-login', '/auth/verify-otp', '/auth/otp/verify', '/auth/verifyOtp'],
        data
    ),
};

export default authService;
