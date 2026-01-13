import api from './api';
import type {
    Comment,
    CreateCommentDto,
    UpdateCommentDto,
    ApiResponse,
    PaginatedResponse,
    PaginationParams,
} from '../types';

export const commentService = {
    // Create root comment
    createComment: async (data: CreateCommentDto): Promise<ApiResponse<Comment>> => {
        const response = await api.post('/comments', data);
        return response.data;
    },

    // Reply to a comment
    replyToComment: async (commentId: string, data: CreateCommentDto): Promise<ApiResponse<Comment>> => {
        const response = await api.post(`/comments/${commentId}/reply`, data);
        return response.data;
    },

    // Get root comments with pagination and sorting
    getComments: async (params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
        const response = await api.get('/comments', { params });
        return response.data;
    },

    // Get replies for a comment
    getReplies: async (commentId: string, params: PaginationParams): Promise<ApiResponse<PaginatedResponse<Comment>>> => {
        const response = await api.get(`/comments/${commentId}/replies`, { params });
        return response.data;
    },

    // Update comment
    updateComment: async (commentId: string, data: UpdateCommentDto): Promise<ApiResponse<Comment>> => {
        const response = await api.put(`/comments/${commentId}`, data);
        return response.data;
    },

    // Delete comment
    deleteComment: async (commentId: string): Promise<ApiResponse<null>> => {
        const response = await api.delete(`/comments/${commentId}`);
        return response.data;
    },

    // Like/Unlike comment
    likeComment: async (commentId: string): Promise<ApiResponse<{ likes: number; dislikes: number; hasLiked: boolean; hasDisliked: boolean }>> => {
        const response = await api.post(`/comments/${commentId}/like`);
        return response.data;
    },

    // Dislike/Undislike comment
    dislikeComment: async (commentId: string): Promise<ApiResponse<{ likes: number; dislikes: number; hasLiked: boolean; hasDisliked: boolean }>> => {
        const response = await api.post(`/comments/${commentId}/dislike`);
        return response.data;
    },
};
