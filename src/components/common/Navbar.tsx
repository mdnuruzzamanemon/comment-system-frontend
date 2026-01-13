import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, LogIn, UserPlus, LogOut, User, ChevronDown } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@hooks/useRedux';
import { logout } from '@store/slices/authSlice';
import { toast } from 'react-toastify';
import './Navbar.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isAuthenticated, user } = useAppSelector((state) => state.auth);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        dispatch(logout());
        toast.success('Logged out successfully');
        setShowDropdown(false);
        navigate('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            <div className="navbar-user-dropdown" ref={dropdownRef}>
                                <button
                                    className="navbar-user-button"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="navbar-avatar">
                                        {user?.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="navbar-username">{user?.username}</span>
                                    <ChevronDown size={16} className={`dropdown-icon ${showDropdown ? 'open' : ''}`} />
                                </button>

                                {showDropdown && (
                                    <div className="navbar-dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="dropdown-user-info">
                                                <div className="dropdown-avatar">
                                                    {user?.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="dropdown-user-details">
                                                    <div className="dropdown-username">{user?.username}</div>
                                                    <div className="dropdown-email">{user?.email}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button onClick={handleLogout} className="dropdown-item danger">
                                            <LogOut size={18} />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
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
