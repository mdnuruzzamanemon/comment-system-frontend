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
    const { token, user } = useAppSelector((state) => state.auth);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most_liked'>('newest');
    const limit = 10;

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
        if (!token) {
            console.log('⚠️ No token, skipping Socket.io setup');
            return;
        }

        console.log('🔌 Setting up Socket.io connection...', { hasUser: !!user });

        // Connect to Socket.io
        socketService.connect(token);

        // Wait a bit for connection to establish
        setTimeout(() => {
            console.log('Socket connected status:', socketService.isConnected());
        }, 1000);

        // Listen for new root comments
        socketService.on('comment:created', (payload: any) => {
            console.log('🆕 New comment event received:', payload);

            const newComment = payload.data;

            if (!newComment || !newComment.id) {
                console.error('Invalid comment data:', newComment);
                return;
            }

            const isMyComment = user && newComment.author.id === user.id;

            // Only add root comments (no parentComment) from other users
            if (!newComment.parentComment && !isMyComment && currentPage === 1 && sortBy === 'newest') {
                setComments((prev) => {
                    if (prev.some(c => c.id === newComment.id)) {
                        return prev;
                    }
                    return [newComment, ...prev];
                });
                toast.success(`${newComment.author.username} added a comment!`, { autoClose: 2000 });
            } else if (!newComment.parentComment && !isMyComment) {
                loadComments();
            }
        });

        // Listen for replies
        socketService.on('comment:reply_created', (payload: any) => {
            console.log('💬 Reply created event received:', payload);

            const { reply, parentId } = payload.data;

            if (!parentId) {
                console.error('Invalid reply data:', payload);
                return;
            }

            const isMyReply = user && reply.author.id === user.id;

            console.log('📝 Reply added to parent:', parentId, 'isMyReply:', isMyReply);

            // Update the parent comment's replyCount (for everyone)
            if (!isMyReply) {
                setComments((prev) =>
                    prev.map((c) =>
                        c.id === parentId
                            ? { ...c, replyCount: (c.replyCount || 0) + 1 }
                            : c
                    )
                );

                toast.success(`${reply.author.username} replied to a comment!`, { autoClose: 2000 });
            }
        });

        // Listen for comment updates
        socketService.on('comment:updated', (payload: any) => {
            console.log('✏️ Comment update event received:', payload);
            const updatedComment = payload.data;

            if (!updatedComment || !updatedComment.id) {
                console.error('Invalid updated comment data:', updatedComment);
                return;
            }

            const isMyComment = user && updatedComment.author.id === user.id;

            if (!isMyComment) {
                setComments((prev) =>
                    prev.map((c) => (c.id === updatedComment.id ? { ...c, ...updatedComment } : c))
                );
                toast.info('Comment updated!', { autoClose: 2000 });
            }
        });

        // Listen for comment deletions
        socketService.on('comment:deleted', (payload: any) => {
            console.log('🗑️ Comment delete event received:', payload);
            const { id, deletedBy } = payload.data;

            if (!id) {
                console.error('Invalid delete event data:', payload);
                return;
            }

            const isMyAction = user && deletedBy?.id === user.id;

            // Only remove from UI if someone else deleted it
            if (!isMyAction) {
                setComments((prev) => prev.filter((c) => c.id !== id));
                toast.info('Comment deleted', { autoClose: 2000 });
            }
        });

        // Listen for like updates - OPTIMIZED with actionBy
        socketService.on('comment:like_updated', (payload: any) => {
            console.log('👍 Like update event received:', payload);
            const likeData = payload.data;

            const commentId = likeData.commentId;
            const likeCount = likeData.likeCount;
            const dislikeCount = likeData.dislikeCount;
            const action = likeData.action;
            const actionBy = likeData.actionBy;

            if (!commentId) {
                console.error('Invalid like event data:', payload);
                return;
            }

            // Get current user from localStorage to ensure we have it
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isMyAction = currentUser && actionBy && actionBy.id === currentUser.id;

            console.log('� Like update:', {
                commentId,
                likeCount,
                dislikeCount,
                action,
                isMyAction,
                currentUserId: currentUser?.id,
                actionById: actionBy?.id
            });

            setComments((prev) =>
                prev.map((c) => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            likeCount: likeCount ?? c.likeCount,
                            dislikeCount: dislikeCount ?? c.dislikeCount,
                            // Update hasLiked/hasDisliked only for current user
                            hasLiked: isMyAction ? (action === 'liked') : c.hasLiked,
                            hasDisliked: isMyAction ? false : c.hasDisliked,
                        };
                    }
                    return c;
                })
            );
        });

        // Listen for dislike updates - OPTIMIZED with actionBy
        socketService.on('comment:dislike_updated', (payload: any) => {
            console.log('👎 Dislike update event received:', payload);
            const dislikeData = payload.data;

            const commentId = dislikeData.commentId;
            const likeCount = dislikeData.likeCount;
            const dislikeCount = dislikeData.dislikeCount;
            const action = dislikeData.action;
            const actionBy = dislikeData.actionBy;

            if (!commentId) {
                console.error('Invalid dislike event data:', payload);
                return;
            }

            // Get current user from localStorage to ensure we have it
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;
            const isMyAction = currentUser && actionBy && actionBy.id === currentUser.id;

            console.log('👎 Dislike update:', {
                commentId,
                likeCount,
                dislikeCount,
                action,
                isMyAction,
                currentUserId: currentUser?.id,
                actionById: actionBy?.id
            });

            setComments((prev) =>
                prev.map((c) => {
                    if (c.id === commentId) {
                        return {
                            ...c,
                            likeCount: likeCount ?? c.likeCount,
                            dislikeCount: dislikeCount ?? c.dislikeCount,
                            // Update hasLiked/hasDisliked only for current user
                            hasLiked: isMyAction ? false : c.hasLiked,
                            hasDisliked: isMyAction ? (action === 'disliked') : c.hasDisliked,
                        };
                    }
                    return c;
                })
            );
        });

        return () => {
            console.log('🔌 Cleaning up Socket.io listeners...');
            socketService.off('comment:created');
            socketService.off('comment:reply_created');
            socketService.off('comment:updated');
            socketService.off('comment:deleted');
            socketService.off('comment:like_updated');
            socketService.off('comment:dislike_updated');
            socketService.disconnect();
        };
    }, [token, user, currentPage, sortBy, loadComments]);

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

                                <div className="pagination-pages">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        const showPage =
                                            page === 1 ||
                                            page === totalPages ||
                                            Math.abs(page - currentPage) <= 1;

                                        const showEllipsis =
                                            (page === currentPage - 2 && currentPage > 3) ||
                                            (page === currentPage + 2 && currentPage < totalPages - 2);

                                        if (showEllipsis) {
                                            return <span key={page} className="pagination-ellipsis">...</span>;
                                        }

                                        if (!showPage) return null;

                                        return (
                                            <button
                                                key={page}
                                                className={`pagination-page ${page === currentPage ? 'active' : ''}`}
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
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
