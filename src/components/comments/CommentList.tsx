import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { Comment } from '@types/index';
import { commentService } from '@services/commentService';
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
