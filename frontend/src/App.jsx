import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from "./pages/Dashboard"
import Attendance from "./pages/Attendance"
import Students from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import Fees from "./pages/Fees"
import Profile from "./pages/Profile"

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Protected routes */}
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/dashboard" element={<Dashboard />} />
                                        <Route 
                                            path="/students" 
                                            element={
                                                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                                                    <Students />
                                                </ProtectedRoute>
                                            } 
                                        />
                                        <Route 
                                            path="/students/:id" 
                                            element={
                                                <ProtectedRoute allowedRoles={['admin', 'teacher']}>
                                                    <StudentProfile />
                                                </ProtectedRoute>
                                            } 
                                        />
                                        <Route path="/attendance" element={<Attendance />} />
                                        <Route 
                                            path="/fees" 
                                            element={
                                                <ProtectedRoute allowedRoles={['admin', 'student']}>
                                                    <Fees />
                                                </ProtectedRoute>
                                            } 
                                        />
                                        <Route path="/profile" element={<Profile />} />
                                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;