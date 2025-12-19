export const API_BASE_URL = 'http://localhost:5000/api';

export const endpoints = {
    // Auth endpoints
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    
    // Student endpoints
    students: `${API_BASE_URL}/students`,
    
    // Attendance endpoints
    attendance: `${API_BASE_URL}/attendance`,
    attendanceStats: `${API_BASE_URL}/attendance/stats`,
    
    // Fee endpoints
    fees: `${API_BASE_URL}/fees`,
    feeStats: `${API_BASE_URL}/fees/stats`,
};