import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CommentState, Comment } from '../../types';

const initialState: CommentState = {
    comments: [],
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    loading: false,
    error: null,
    sortBy: 'newest',
};

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        setComments: (state, action: PayloadAction<Comment[]>) => {
            state.comments = action.payload;
            state.loading = false;
            state.error = null;
        },
        addComment: (state, action: PayloadAction<Comment>) => {
            state.comments.unshift(action.payload);
            state.totalComments += 1;
        },
        updateComment: (state, action: PayloadAction<Comment>) => {
            const index = state.comments.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
        },
        deleteComment: (state, action: PayloadAction<string>) => {
            state.comments = state.comments.filter((c) => c.id !== action.payload);
            state.totalComments -= 1;
        },
        updateLikes: (
            state,
            action: PayloadAction<{ commentId: string; likeCount: number; dislikeCount: number }>
        ) => {
            const comment = state.comments.find((c) => c.id === action.payload.commentId);
            if (comment) {
                comment.likeCount = action.payload.likeCount;
                comment.dislikeCount = action.payload.dislikeCount;
            }
        },
        setPagination: (
            state,
            action: PayloadAction<{
                currentPage: number;
                totalPages: number;
                totalComments: number;
            }>
        ) => {
            state.currentPage = action.payload.currentPage;
            state.totalPages = action.payload.totalPages;
            state.totalComments = action.payload.totalComments;
        },
        setSortBy: (state, action: PayloadAction<'newest' | 'oldest' | 'most_liked' | 'most_disliked'>) => {
            state.sortBy = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    setComments,
    addComment,
    updateComment,
    deleteComment,
    updateLikes,
    setPagination,
    setSortBy,
    setLoading,
    setError,
} = commentSlice.actions;

export default commentSlice.reducer;
