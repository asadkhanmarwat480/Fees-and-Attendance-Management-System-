const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    markAttendance,
    getAttendanceByDateRange,
    updateAttendance,
    getAttendanceStats
} = require('../controllers/attendanceController');

// All routes require authentication
router.use(auth);

// Mark attendance (Teacher and Admin)
router.post('/', authorize('teacher', 'admin'), markAttendance);

// Get attendance by date range
router.get('/', getAttendanceByDateRange);

// Update attendance (Teacher and Admin)
router.put('/:id', authorize('teacher', 'admin'), updateAttendance);

// Get attendance statistics
router.get('/stats', getAttendanceStats);

module.exports = router;