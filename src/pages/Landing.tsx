import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';
import { Shield, Zap, ThumbsUp, MessageCircle, ArrowUpDown, Smartphone } from 'lucide-react';
import Navbar from '@components/common/Navbar';
import './Landing.css';

const Landing: React.FC = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    return (
        <>
            <Navbar />
            <div className="landing-container">
                <div className="landing-content">
                    <div className="landing-header fade-in">
                        <h1 className="landing-title">
                            Real-Time Comment System
                        </h1>
                        <p className="landing-subtitle">
                            Engage your audience with a modern, secure, and lightning-fast commenting platform
                        </p>
                    </div>

                    <div className="features-grid fade-in">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Secure Authentication</h3>
                            <p>JWT-based authentication with automatic token refresh for seamless security</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Real-time Updates</h3>
                            <p>Instant comment updates using WebSocket technology for live interactions</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <ThumbsUp size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Like & Dislike</h3>
                            <p>Express opinions with one-click reactions and see community sentiment</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <MessageCircle size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Nested Replies</h3>
                            <p>Support for threaded conversations with unlimited reply depth</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <ArrowUpDown size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Smart Sorting</h3>
                            <p>Sort comments by newest, most liked, or most disliked with pagination</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Smartphone size={40} strokeWidth={1.5} />
                            </div>
                            <h3>Responsive Design</h3>
                            <p>Beautiful, modern interface that works perfectly on all devices</p>
                        </div>
                    </div>

                    <div className="landing-cta fade-in">
                        {isAuthenticated ? (
                            <Link to="/comments" className="btn btn-primary btn-large">
                                Go to Comments →
                            </Link>
                        ) : (
                            <div className="cta-buttons">
                                <Link to="/register" className="btn btn-primary btn-large">
                                    Get Started Free
                                </Link>
                                <Link to="/login" className="btn btn-secondary btn-large">
                                    Sign In
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="tech-stack fade-in">
                        <p className="tech-label">Powered By</p>
                        <div className="tech-badges">
                            <span className="tech-badge">React 19</span>
                            <span className="tech-badge">TypeScript</span>
                            <span className="tech-badge">Vite</span>
                            <span className="tech-badge">Redux Toolkit</span>
                            <span className="tech-badge">Socket.io</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Landing;
