// User and Authentication Types
export interface User {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    createdAt: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
}

// Comment Types
export interface Comment {
    id: string;
    content: string;
    userId: string;
    user: User;
    likes: number;
    dislikes: number;
    userLikeStatus?: 'like' | 'dislike' | null;
    parentId: string | null;
    replies?: Comment[];
    createdAt: string;
    updatedAt: string;
}

export interface CommentState {
    comments: Comment[];
    currentPage: number;
    totalPages: number;
    totalComments: number;
    loading: boolean;
    error: string | null;
    sortBy: 'newest' | 'mostLiked' | 'mostDisliked';
}

export interface CreateCommentDto {
    content: string;
    parentId?: string | null;
}

export interface UpdateCommentDto {
    content: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: 'newest' | 'mostLiked' | 'mostDisliked';
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

// Socket Event Types
export interface SocketEvents {
    NEW_COMMENT: 'new_comment';
    UPDATE_COMMENT: 'update_comment';
    DELETE_COMMENT: 'delete_comment';
    LIKE_UPDATE: 'like_update';
}

export interface LikeUpdatePayload {
    commentId: string;
    likes: number;
    dislikes: number;
}
