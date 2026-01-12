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

// Comment Types (matching backend response)
export interface Comment {
    id: string;
    content: string;
    author: {
        id: string;
        username: string;
    };
    parentComment: string | null;
    likeCount: number;
    dislikeCount: number;
    replyCount: number;
    hasLiked: boolean;
    hasDisliked: boolean;
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
    sortBy: 'newest' | 'oldest' | 'most_liked';
}

export interface CreateCommentDto {
    content: string;
}

export interface UpdateCommentDto {
    content: string;
}

export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: 'newest' | 'oldest' | 'most_liked';
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface PaginatedResponse<T> {
    comments: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Socket Event Types
export interface SocketEvents {
    NEW_COMMENT: 'comment:new';
    UPDATE_COMMENT: 'comment:update';
    DELETE_COMMENT: 'comment:delete';
    LIKE_UPDATE: 'comment:like';
}

export interface LikeUpdatePayload {
    commentId: string;
    likeCount: number;
    dislikeCount: number;
}
