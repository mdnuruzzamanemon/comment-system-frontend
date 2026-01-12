import api from './api';
import {
    LoginCredentials,
    RegisterCredentials,
    User,
    ApiResponse,
} from '@types/index';

export const authService = {
    // Register new user
    register: async (credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
        const response = await api.post('/auth/register', credentials);
        return response.data;
    },

    // Login user
    login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; accessToken: string }>> => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Refresh access token (uses httpOnly cookie automatically)
    refresh: async (): Promise<ApiResponse<{ accessToken: string }>> => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    // Get user profile
    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Logout
    logout: async (): Promise<ApiResponse<null>> => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Logout from all devices
    logoutAll: async (): Promise<ApiResponse<null>> => {
        const response = await api.post('/auth/logout-all');
        return response.data;
    },
};
