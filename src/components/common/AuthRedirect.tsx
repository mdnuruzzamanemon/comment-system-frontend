import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@hooks/useRedux';

interface AuthRedirectProps {
    children: React.ReactNode;
}

/**
 * Redirects authenticated users to /comments
 * Use this to wrap Login and Register pages
 */
const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/comments', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Don't render children if authenticated (will redirect)
    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
};

export default AuthRedirect;
