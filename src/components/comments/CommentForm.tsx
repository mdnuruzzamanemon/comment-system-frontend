import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { commentService } from '@services/commentService';
import './CommentForm.css';

interface CommentFormProps {
    onCommentAdded: () => void;
    parentId?: string;
    onCancel?: () => void;
    placeholder?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
    onCommentAdded,
    parentId,
    onCancel,
    placeholder = 'Write a comment...',
}) => {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        setIsSubmitting(true);

        try {
            if (parentId) {
                await commentService.replyToComment(parentId, { content: content.trim() });
                toast.success('Reply added!');
            } else {
                await commentService.createComment({ content: content.trim() });
                toast.success('Comment posted!');
            }

            setContent('');
            onCommentAdded();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to post comment';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <textarea
                className="textarea comment-textarea"
                placeholder={placeholder}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                rows={parentId ? 2 : 3}
            />
            <div className="comment-form-actions">
                {onCancel && (
                    <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    className="btn btn-primary btn-sm"
                    disabled={isSubmitting || !content.trim()}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-small"></span>
                            Posting...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            {parentId ? 'Reply' : 'Post Comment'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

export default CommentForm;
