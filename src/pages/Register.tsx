import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@hooks/useRedux';
import { setCredentials, setLoading, setError } from '@store/slices/authSlice';
import { authService } from '@services/authService';
import './AuthPages.css';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.username.length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        dispatch(setLoading(true));

        try {
            const response = await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password,
            });

            if (response.success) {
                // Store user and token
                dispatch(setCredentials({
                    user: response.data.user,
                    token: response.data.accessToken,
                }));

                toast.success(response.message || 'Registration successful!');

                // Redirect to comments page
                navigate('/comments');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMessage);
            dispatch(setError(errorMessage));
        } finally {
            setIsSubmitting(false);
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join our community today</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="input"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="username"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="input"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="input"
                            placeholder="Create a password (min 6 characters)"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            className="input"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-small"></span>
                                Creating account...
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="auth-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
