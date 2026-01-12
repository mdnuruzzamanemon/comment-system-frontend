import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@hooks/useRedux';
import { setCredentials, setLoading, setError } from '@store/slices/authSlice';
import { authService } from '@services/authService';
import './AuthPages.css';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
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
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Please enter a valid email');
            return;
        }

        setIsSubmitting(true);
        dispatch(setLoading(true));

        try {
            const response = await authService.login({
                email: formData.email,
                password: formData.password,
            });

            if (response.success) {
                // Store user and token
                dispatch(setCredentials({
                    user: response.data.user,
                    token: response.data.accessToken,
                }));

                toast.success(response.message || 'Login successful!');

                // Redirect to comments page
                navigate('/comments');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
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
                    <h1>Welcome Back</h1>
                    <p>Sign in to continue to Comment System</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
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
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={isSubmitting}
                            autoComplete="current-password"
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
