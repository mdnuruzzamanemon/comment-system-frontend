import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '@pages/Landing';
import Login from '@pages/Login';
import Register from '@pages/Register';
import Comments from '@pages/Comments';
import ProtectedRoute from '@components/common/ProtectedRoute';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
