import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Users, Zap, Shield, TrendingUp, Heart } from 'lucide-react';
import Navbar from '@components/common/Navbar';
import './Landing.css';

const Landing: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">
                            Join the Conversation
                        </h1>
                        <p className="hero-subtitle">
                            A modern platform where your voice matters. Share thoughts, engage in discussions, and connect with a vibrant community.
                        </p>
                        <div className="hero-actions">
                            <Link to="/register" className="btn btn-primary btn-lg">
                                Get Started Free
                            </Link>
                            <Link to="/comments" className="btn btn-secondary btn-lg">
                                Explore Comments
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="stat-item">
                                <Users size={24} />
                                <div>
                                    <div className="stat-number">10K+</div>
                                    <div className="stat-label">Active Users</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <MessageSquare size={24} />
                                <div>
                                    <div className="stat-number">50K+</div>
                                    <div className="stat-label">Comments</div>
                                </div>
                            </div>
                            <div className="stat-item">
                                <Heart size={24} />
                                <div>
                                    <div className="stat-number">100K+</div>
                                    <div className="stat-label">Interactions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Why Choose CommentHub?</h2>
                        <p>Everything you need for meaningful conversations</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap />
                            </div>
                            <h3>Real-Time Updates</h3>
                            <p>See comments, likes, and replies instantly as they happen. Stay connected with live discussions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <MessageSquare />
                            </div>
                            <h3>Threaded Discussions</h3>
                            <p>Organize conversations with nested replies. Follow discussions that matter to you.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield />
                            </div>
                            <h3>Secure & Private</h3>
                            <p>Your data is protected with industry-standard security. Comment with confidence.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <TrendingUp />
                            </div>
                            <h3>Smart Sorting</h3>
                            <p>Find the best content with intelligent sorting. Most liked, newest, or trending discussions.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Users />
                            </div>
                            <h3>Community Driven</h3>
                            <p>Built for the community, by the community. Your feedback shapes our platform.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Heart />
                            </div>
                            <h3>Express Yourself</h3>
                            <p>Like, dislike, and engage with content. Make your voice heard in every discussion.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Join the Community?</h2>
                        <p>Start engaging in meaningful conversations today. It's free and takes less than a minute.</p>
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Create Your Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <MessageSquare size={32} />
                            <span>CommentHub</span>
                        </div>
                        <div className="footer-links">
                            <Link to="/comments">Comments</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Sign Up</Link>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 CommentHub. All rights reserved.</p>
                        <p className="developer-credit">
                            Developed by <strong>Md. Nuruzzaman Emon</strong>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
