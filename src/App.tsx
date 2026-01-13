import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@pages/Landing';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Comments from '@pages/Comments';
import ProtectedRoute from '@components/common/ProtectedRoute';
import AuthRedirect from '@components/common/AuthRedirect';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                    path="/login"
                    element={
                        <AuthRedirect>
                            <Login />
                        </AuthRedirect>
                    }
                />
                <Route
                    path="/register"
                    element={
                        <AuthRedirect>
                            <Register />
                        </AuthRedirect>
                    }
                />
                <Route
                    path="/comments"
                    element={
                        <ProtectedRoute>
                            <Comments />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
