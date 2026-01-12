import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageCircle, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'react-toastify';
import { Comment } from '@types/index';
import { commentService } from '@services/commentService';
import { useAppSelector } from '@hooks/useRedux';
import CommentForm from './CommentForm';
import './CommentItem.css';

interface CommentItemProps {
    comment: Comment;
    onUpdate: () => void;
    onReplyClick?: (commentId: string) => void;
    showReplies?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    onUpdate,
    onReplyClick,
    showReplies = true,
}) => {
    const { user } = useAppSelector((state) => state.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [isReplying, setIsReplying] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Local state for optimistic updates
    const [localLikeCount, setLocalLikeCount] = useState(comment.likeCount);
    const [localDislikeCount, setLocalDislikeCount] = useState(comment.dislikeCount);
    const [localHasLiked, setLocalHasLiked] = useState(comment.hasLiked);
    const [localHasDisliked, setLocalHasDisliked] = useState(comment.hasDisliked);

    const isOwner = user?.id === comment.author.id;

    const handleLike = async () => {
        // Optimistic update
        const wasLiked = localHasLiked;
        const wasDisliked = localHasDisliked;

        if (wasLiked) {
            // Unlike
            setLocalHasLiked(false);
            setLocalLikeCount(localLikeCount - 1);
        } else {
            // Like
            setLocalHasLiked(true);
            setLocalLikeCount(localLikeCount + 1);
            if (wasDisliked) {
                setLocalHasDisliked(false);
                setLocalDislikeCount(localDislikeCount - 1);
            }
        }

        try {
            await commentService.likeComment(comment.id);
            // Server will broadcast the update via Socket.io
        } catch (error: any) {
            // Revert on error
            setLocalHasLiked(wasLiked);
            setLocalHasDisliked(wasDisliked);
            setLocalLikeCount(comment.likeCount);
            setLocalDislikeCount(comment.dislikeCount);
            toast.error(error.response?.data?.message || 'Failed to like comment');
        }
    };

    const handleDislike = async () => {
        // Optimistic update
        const wasLiked = localHasLiked;
        const wasDisliked = localHasDisliked;

        if (wasDisliked) {
            // Undislike
            setLocalHasDisliked(false);
            setLocalDislikeCount(localDislikeCount - 1);
        } else {
            // Dislike
            setLocalHasDisliked(true);
            setLocalDislikeCount(localDislikeCount + 1);
            if (wasLiked) {
                setLocalHasLiked(false);
                setLocalLikeCount(localLikeCount - 1);
            }
        }

        try {
            await commentService.dislikeComment(comment.id);
            // Server will broadcast the update via Socket.io
        } catch (error: any) {
            // Revert on error
            setLocalHasLiked(wasLiked);
            setLocalHasDisliked(wasDisliked);
            setLocalLikeCount(comment.likeCount);
            setLocalDislikeCount(comment.dislikeCount);
            toast.error(error.response?.data?.message || 'Failed to dislike comment');
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        setIsUpdating(true);
        try {
            await commentService.updateComment(comment.id, { content: editContent.trim() });
            toast.success('Comment updated!');
            setIsEditing(false);
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update comment');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            await commentService.deleteComment(comment.id);
            toast.success('Comment deleted!');
            onUpdate();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete comment');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    // Update local state when props change (from Socket.io)
    React.useEffect(() => {
        setLocalLikeCount(comment.likeCount);
        setLocalDislikeCount(comment.dislikeCount);
        setLocalHasLiked(comment.hasLiked);
        setLocalHasDisliked(comment.hasDisliked);
    }, [comment.likeCount, comment.dislikeCount, comment.hasLiked, comment.hasDisliked]);

    return (
        <div className="comment-item">
            <div className="comment-header">
                <div className="comment-author">
                    <div className="comment-avatar">
                        {comment.author.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-meta">
                        <span className="comment-username">{comment.author.username}</span>
                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                    </div>
                </div>

                {isOwner && (
                    <div className="comment-menu">
                        <button
                            className="btn-icon"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical size={18} />
                        </button>
                        {showMenu && (
                            <div className="comment-dropdown">
                                <button onClick={() => { setIsEditing(true); setShowMenu(false); }}>
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                                <button onClick={() => { handleDelete(); setShowMenu(false); }} className="danger">
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="comment-content">
                {isEditing ? (
                    <div className="comment-edit">
                        <textarea
                            className="textarea"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            disabled={isUpdating}
                            rows={3}
                        />
                        <div className="comment-edit-actions">
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                                disabled={isUpdating}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleEdit}
                                disabled={isUpdating || !editContent.trim()}
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p>{comment.content}</p>
                )}
            </div>

            <div className="comment-actions">
                <button
                    className={`comment-action ${localHasLiked ? 'active' : ''}`}
                    onClick={handleLike}
                >
                    <ThumbsUp size={16} />
                    <span>{localLikeCount}</span>
                </button>

                <button
                    className={`comment-action ${localHasDisliked ? 'active' : ''}`}
                    onClick={handleDislike}
                >
                    <ThumbsDown size={16} />
                    <span>{localDislikeCount}</span>
                </button>

                {showReplies && (
                    <button
                        className="comment-action"
                        onClick={() => setIsReplying(!isReplying)}
                    >
                        <MessageCircle size={16} />
                        <span>{comment.replyCount > 0 ? `${comment.replyCount} ${comment.replyCount === 1 ? 'Reply' : 'Replies'}` : 'Reply'}</span>
                    </button>
                )}
            </div>

            {isReplying && (
                <div className="comment-reply-form">
                    <CommentForm
                        parentId={comment.id}
                        onCommentAdded={() => {
                            setIsReplying(false);
                            onUpdate();
                        }}
                        onCancel={() => setIsReplying(false)}
                        placeholder="Write a reply..."
                    />
                </div>
            )}
        </div>
    );
};

export default CommentItem;
