import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUpDown, Loader } from 'lucide-react';
import { useAppSelector } from '@hooks/useRedux';
import { commentService } from '@services/commentService';
import socketService from '@services/socket';
import { Comment } from '@types/index';
import { toast } from 'react-toastify';
import Navbar from '@components/common/Navbar';
import CommentForm from '@components/comments/CommentForm';
import CommentList from '@components/comments/CommentList';
import './Comments.css';

const Comments: React.FC = () => {
    const { token } = useAppSelector((state) => state.auth);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
    const limit = 20;

    const loadComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await commentService.getComments({
                page: currentPage,
                limit,
                sortBy,
            });
            setComments(response.data.comments);
            setTotalPages(response.data.pagination.pages);
        } catch (error: any) {
            toast.error('Failed to load comments');
            console.error('Error loading comments:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, sortBy]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    // Socket.io real-time updates
    useEffect(() => {
        if (token) {
            // Connect to Socket.io
            socketService.connect(token);

            // Listen for new comments
            socketService.on('comment:new', (newComment: Comment) => {
                console.log('New comment received:', newComment);
                // Only add if it's a root comment and we're on the first page with newest sort
                if (!newComment.parentComment && currentPage === 1 && sortBy === 'newest') {
                    setComments((prev) => [newComment, ...prev]);
                }
            });

            // Listen for comment updates
            socketService.on('comment:update', (updatedComment: Comment) => {
                console.log('Comment updated:', updatedComment);
                setComments((prev) =>
                    prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
                );
            });

            // Listen for comment deletions
            socketService.on('comment:delete', (data: { commentId: string }) => {
                console.log('Comment deleted:', data.commentId);
                setComments((prev) => prev.filter((c) => c.id !== data.commentId));
            });

            // Listen for like/dislike updates
            socketService.on('comment:like', (data: { commentId: string; likeCount: number; dislikeCount: number }) => {
                console.log('Like update:', data);
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === data.commentId
                            ? { ...c, likeCount: data.likeCount, dislikeCount: data.dislikeCount }
                            : c
                    )
                );
            });

            return () => {
                socketService.off('comment:new');
                socketService.off('comment:update');
                socketService.off('comment:delete');
                socketService.off('comment:like');
                socketService.disconnect();
            };
        }
    }, [token, currentPage, sortBy]);

    const handleSortChange = (newSort: 'newest' | 'oldest' | 'most_liked') => {
        setSortBy(newSort);
        setCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <Navbar />
            <div className="comments-page">
                <div className="container">
                    <div className="comments-header">
                        <h1>Comments</h1>
                        <p>Share your thoughts and engage with the community</p>
                    </div>

                    <div className="comments-container">
                        <div className="comments-form-section">
                            <CommentForm onCommentAdded={loadComments} />
                        </div>

                        <div className="comments-controls">
                            <div className="comments-sort">
                                <ArrowUpDown size={18} />
                                <span>Sort by:</span>
                                <div className="sort-buttons">
                                    <button
                                        className={`sort-btn ${sortBy === 'newest' ? 'active' : ''}`}
                                        onClick={() => handleSortChange('newest')}
                                    >
                                        Newest
                                    </button>
                                    <button
                                        className={`sort-btn ${sortBy === 'oldest' ? 'active' : ''}`}
                                        onClick={() => handleSortChange('oldest')}
                                    >
                                        Oldest
                                    </button>
                                    <button
                                        className={`sort-btn ${sortBy === 'most_liked' ? 'active' : ''}`}
                                        onClick={() => handleSortChange('most_liked')}
                                    >
                                        Most Liked
                                    </button>
                                </div>
                            </div>
                        </div>

                        <CommentList comments={comments} onUpdate={loadComments} loading={loading} />

                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </button>
                                <div className="pagination-info">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Comments;
