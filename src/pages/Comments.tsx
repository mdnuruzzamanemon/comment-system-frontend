import React from 'react';
import './Comments.css';

const Comments: React.FC = () => {
    return (
        <div className="comments-page">
            <div className="container">
                <div className="comments-header">
                    <h1>Comments</h1>
                    <p>Share your thoughts and engage with the community</p>
                </div>

                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                        🚧 Coming Soon!
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                        The comments section is under construction. Check back soon!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Comments;
