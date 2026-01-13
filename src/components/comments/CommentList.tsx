import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader } from 'lucide-react';
import type { Comment } from '../../types';
import { commentService } from '@services/commentService';
import socketService from '@services/socket';
import { toast } from 'react-toastify';
import CommentItem from './CommentItem';
import './CommentList.css';

interface CommentListProps {
    comments: Comment[];
    onUpdate: () => void;
    loading?: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onUpdate, loading }) => {
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

    const toggleReplies = async (commentId: string) => {
        const newExpanded = new Set(expandedReplies);

        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
            setExpandedReplies(newExpanded);
        } else {
            newExpanded.add(commentId);
            setExpandedReplies(newExpanded);

            // Load replies if not already loaded
            if (!replies[commentId]) {
                setLoadingReplies(new Set(loadingReplies).add(commentId));
                try {
                    const response = await commentService.getReplies(commentId, {
                        page: 1,
                        limit: 20,
                        sortBy: 'oldest',
                    });
                    setReplies({ ...replies, [commentId]: response.data.comments });
                } catch (error: any) {
                    toast.error('Failed to load replies');
                } finally {
                    const newLoading = new Set(loadingReplies);
                    newLoading.delete(commentId);
                    setLoadingReplies(newLoading);
                }
            }
        }
    };

    const handleReplyUpdate = async (commentId: string) => {
        // Reload replies for this comment
        try {
            const response = await commentService.getReplies(commentId, {
                page: 1,
                limit: 20,
                sortBy: 'oldest',
            });
            setReplies({ ...replies, [commentId]: response.data.comments });
            onUpdate(); // Also update parent to refresh reply count
        } catch (error) {
            console.error('Failed to reload replies');
        }
    };

    // Socket.io real-time updates for replies
    useEffect(() => {
        // Get current user from localStorage
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;

        // Listen for new replies
        const handleReplyCreated = (payload: any) => {
            const { reply, parentId } = payload.data;
            const isMyReply = currentUser && reply.author.id === currentUser.id;

            console.log('💬 Reply created in CommentList:', { reply, parentId, isMyReply });

            // If the parent comment's replies are expanded, add the new reply
            if (expandedReplies.has(parentId)) {
                setReplies((prevReplies) => {
                    const parentReplies = prevReplies[parentId] || [];

                    // Check if reply already exists
                    if (parentReplies.some(r => r.id === reply.id)) {
                        return prevReplies;
                    }

                    // Add new reply to the end (oldest first)
                    return {
                        ...prevReplies,
                        [parentId]: [...parentReplies, reply],
                    };
                });
            }

            // Update parent comment to refresh reply count
            onUpdate();
        };

        // Listen for like updates on replies
        const handleLikeUpdate = (payload: any) => {
            const { commentId, likeCount, dislikeCount, action, actionBy } = payload.data;
            const isMyAction = currentUser && actionBy && actionBy.id === currentUser.id;

            // Update reply if it exists in any of the loaded replies
            setReplies((prevReplies) => {
                const newReplies = { ...prevReplies };
                let updated = false;

                Object.keys(newReplies).forEach((parentId) => {
                    newReplies[parentId] = newReplies[parentId].map((reply) => {
                        if (reply.id === commentId) {
                            updated = true;
                            return {
                                ...reply,
                                likeCount: likeCount ?? reply.likeCount,
                                dislikeCount: dislikeCount ?? reply.dislikeCount,
                                hasLiked: isMyAction ? (action === 'liked') : reply.hasLiked,
                                hasDisliked: isMyAction ? false : reply.hasDisliked,
                            };
                        }
                        return reply;
                    });
                });

                return updated ? newReplies : prevReplies;
            });
        };

        // Listen for dislike updates on replies
        const handleDislikeUpdate = (payload: any) => {
            const { commentId, likeCount, dislikeCount, action, actionBy } = payload.data;
            const isMyAction = currentUser && actionBy && actionBy.id === currentUser.id;

            setReplies((prevReplies) => {
                const newReplies = { ...prevReplies };
                let updated = false;

                Object.keys(newReplies).forEach((parentId) => {
                    newReplies[parentId] = newReplies[parentId].map((reply) => {
                        if (reply.id === commentId) {
                            updated = true;
                            return {
                                ...reply,
                                likeCount: likeCount ?? reply.likeCount,
                                dislikeCount: dislikeCount ?? reply.dislikeCount,
                                hasLiked: isMyAction ? false : reply.hasLiked,
                                hasDisliked: isMyAction ? (action === 'disliked') : reply.hasDisliked,
                            };
                        }
                        return reply;
                    });
                });

                return updated ? newReplies : prevReplies;
            });
        };

        // Listen for reply updates (edit)
        const handleReplyUpdated = (payload: any) => {
            const updatedReply = payload.data;

            setReplies((prevReplies) => {
                const newReplies = { ...prevReplies };
                let updated = false;

                Object.keys(newReplies).forEach((parentId) => {
                    newReplies[parentId] = newReplies[parentId].map((reply) => {
                        if (reply.id === updatedReply.id) {
                            updated = true;
                            return { ...reply, ...updatedReply };
                        }
                        return reply;
                    });
                });

                return updated ? newReplies : prevReplies;
            });
        };

        // Listen for reply deletions
        const handleReplyDeleted = (payload: any) => {
            const { id } = payload.data;

            setReplies((prevReplies) => {
                const newReplies = { ...prevReplies };
                let updated = false;

                Object.keys(newReplies).forEach((parentId) => {
                    const filteredReplies = newReplies[parentId].filter((reply) => reply.id !== id);
                    if (filteredReplies.length !== newReplies[parentId].length) {
                        updated = true;
                        newReplies[parentId] = filteredReplies;
                    }
                });

                return updated ? newReplies : prevReplies;
            });

            // Also update parent comment to refresh reply count
            onUpdate();
        };

        // Register Socket.io listeners
        socketService.on('comment:reply_created', handleReplyCreated);
        socketService.on('comment:like_updated', handleLikeUpdate);
        socketService.on('comment:dislike_updated', handleDislikeUpdate);
        socketService.on('comment:updated', handleReplyUpdated);
        socketService.on('comment:deleted', handleReplyDeleted);

        // Cleanup
        return () => {
            socketService.off('comment:reply_created', handleReplyCreated);
            socketService.off('comment:like_updated', handleLikeUpdate);
            socketService.off('comment:dislike_updated', handleDislikeUpdate);
            socketService.off('comment:updated', handleReplyUpdated);
            socketService.off('comment:deleted', handleReplyDeleted);
        };
    }, [onUpdate, expandedReplies]);

    if (loading) {
        return (
            <div className="comment-list-loading">
                <Loader className="spinner" size={40} />
                <p>Loading comments...</p>
            </div>
        );
    }

    if (comments.length === 0) {
        return (
            <div className="comment-list-empty">
                <p>No comments yet. Be the first to comment!</p>
            </div>
        );
    }

    return (
        <div className="comment-list">
            {comments.map((comment) => (
                <div key={comment.id} className="comment-wrapper">
                    <CommentItem
                        comment={comment}
                        onUpdate={() => {
                            onUpdate();
                            if (expandedReplies.has(comment.id)) {
                                handleReplyUpdate(comment.id);
                            }
                        }}
                    />

                    {comment.replyCount > 0 && (
                        <button
                            className="show-replies-btn"
                            onClick={() => toggleReplies(comment.id)}
                        >
                            {expandedReplies.has(comment.id) ? (
                                <>
                                    <ChevronUp size={16} />
                                    Hide {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={16} />
                                    Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
                                </>
                            )}
                        </button>
                    )}

                    {expandedReplies.has(comment.id) && (
                        <div className="replies-container">
                            {loadingReplies.has(comment.id) ? (
                                <div className="replies-loading">
                                    <Loader className="spinner-small" size={20} />
                                    <span>Loading replies...</span>
                                </div>
                            ) : (
                                replies[comment.id]?.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        onUpdate={() => handleReplyUpdate(comment.id)}
                                        showReplies={false}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CommentList;
