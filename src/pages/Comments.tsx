import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUpDown } from 'lucide-react';
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
            console.log('🔌 Setting up Socket.io connection...');

            // Connect to Socket.io
            socketService.connect(token);

            // Wait a bit for connection to establish
            setTimeout(() => {
                console.log('Socket connected status:', socketService.isConnected());
            }, 1000);

            // Listen for new comments
            socketService.on('comment:created', (eventData: any) => {
                console.log('🆕 New comment event received:', eventData);

                // Extract the actual comment data
                const newComment = eventData.data || eventData;

                console.log('Extracted comment:', newComment);

                // Validate comment has required fields
                if (!newComment || !newComment.id) {
                    console.error('Invalid comment data:', newComment);
                    return;
                }

                // Only add if it's a root comment and we're on the first page with newest sort
                if (!newComment.parentComment && currentPage === 1 && sortBy === 'newest') {
                    setComments((prev) => {
                        // Check if comment already exists
                        if (prev.some(c => c.id === newComment.id)) {
                            console.log('Comment already exists, skipping');
                            return prev;
                        }
                        console.log('Adding new comment to list');
                        return [newComment, ...prev];
                    });
                    toast.success('New comment added!', { autoClose: 2000 });
                } else {
                    console.log('Comment not added to current view, reloading...');
                    loadComments();
                }
            });

            // Listen for comment updates
            socketService.on('comment:updated', (eventData: any) => {
                console.log('✏️ Comment update event received:', eventData);
                const updatedComment = eventData.data || eventData;

                if (!updatedComment || !updatedComment.id) {
                    console.error('Invalid updated comment data:', updatedComment);
                    return;
                }

                setComments((prev) =>
                    prev.map((c) => (c.id === updatedComment.id ? { ...c, ...updatedComment } : c))
                );
                toast.info('Comment updated!', { autoClose: 2000 });
            });

            // Listen for comment deletions
            socketService.on('comment:deleted', (eventData: any) => {
                console.log('🗑️ Comment delete event received:', eventData);
                const commentId = eventData.data?.id || eventData.commentId || eventData.id;

                if (!commentId) {
                    console.error('Invalid delete event data:', eventData);
                    return;
                }

                setComments((prev) => prev.filter((c) => c.id !== commentId));
                toast.info('Comment deleted', { autoClose: 2000 });
            });

            // Listen for like/dislike updates
            socketService.on('comment:liked', (eventData: any) => {
                console.log('👍 Like update event received:', eventData);
                const likeData = eventData.data || eventData;

                if (!likeData || !likeData.commentId) {
                    console.error('Invalid like event data:', eventData);
                    return;
                }

                setComments((prev) =>
                    prev.map((c) =>
                        c.id === likeData.commentId
                            ? {
                                ...c,
                                likeCount: likeData.likeCount ?? c.likeCount,
                                dislikeCount: likeData.dislikeCount ?? c.dislikeCount,
                                hasLiked: likeData.hasLiked ?? c.hasLiked,
                                hasDisliked: likeData.hasDisliked ?? c.hasDisliked,
                            }
                            : c
                    )
                );
            });

            return () => {
                console.log('🔌 Cleaning up Socket.io listeners...');
                socketService.off('comment:created');
                socketService.off('comment:updated');
                socketService.off('comment:deleted');
                socketService.off('comment:liked');
                socketService.disconnect();
            };
        }
    }, [token, currentPage, sortBy, loadComments]);

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
