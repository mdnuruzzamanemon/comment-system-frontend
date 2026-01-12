import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/useRedux';
import { logout } from '@store/slices/authSlice';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <MessageSquare size={28} />
                    <span>CommentHub</span>
                </Link>

                <div className="navbar-menu">
                    {isAuthenticated ? (
                        <>
                            <Link to="/comments" className="navbar-link">
                                Comments
                            </Link>
                            <div className="navbar-user">
                                <span className="navbar-username">{user?.username}</span>
                                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary btn-sm">
                                <LogIn size={16} />
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                <UserPlus size={16} />
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
