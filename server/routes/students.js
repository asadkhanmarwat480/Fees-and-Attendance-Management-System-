/**
 * Student Routes
 * API endpoints for student management with role-based access control
 */

const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getNextRollNumber,
  restoreStudent,
  getClassStatistics,
  exportStudents,
} = require('../controllers/studentController');

// ============================================
// Middleware: Require authentication for all routes
// ============================================
router.use(auth);

// ============================================
// GET ROUTES
// ============================================

/**
 * GET /api/students
 * Fetch all students with pagination, search, filters
 * Query params: page, limit, search, className, section, gender, status, sortBy, sortOrder
 * Accessible by: Admin, Teacher
 */
router.get('/', authorize('admin', 'teacher'), getAllStudents);

/**
 * GET /api/students/search
 * Real-time search for students
 * Query params: q (search query), limit
 * Accessible by: Admin, Teacher
 */
router.get('/search', authorize('admin', 'teacher'), searchStudents);

/**
 * GET /api/students/next-roll-number
 * Get next available roll number for a class/section
 * Query params: className, section
 * Accessible by: Admin
 */
router.get('/next-roll-number', authorize('admin'), getNextRollNumber);

/**
 * GET /api/students/class-statistics/:className
 * Get statistics for a class (sections, gender distribution)
 * Query params: className
 * Accessible by: Admin, Teacher
 */
router.get('/class-statistics', authorize('admin', 'teacher'), getClassStatistics);

/**
 * GET /api/students/export
 * Export students to CSV
 * Query params: className, section (optional filters)
 * Accessible by: Admin
 */
router.get('/export', authorize('admin'), exportStudents);

/**
 * GET /api/students/:id
 * Fetch single student by ID
 * Accessible by: Admin, Teacher, or the student themselves
 */
router.get('/:id', async (req, res, next) => {
  // Check if student is accessing their own profile
  if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only access your own profile',
    });
  }
  next();
}, getStudentById);

// ============================================
// POST ROUTES
// ============================================

/**
 * POST /api/students
 * Create a new student
 * Body: { fullName, email, className, section, rollNo (optional), gender, dateOfBirth, parentName, parentPhone, emergencyPhone, address, photoUrl }
 * Accessible by: Admin, Teacher
 */
router.post('/', authorize('admin', 'teacher'), createStudent);

/**
 * POST /api/students/:id/restore
 * Restore a soft-deleted student
 * Accessible by: Admin
 */
router.post('/:id/restore', authorize('admin'), restoreStudent);

// ============================================
// PUT ROUTES
// ============================================

/**
 * PUT /api/students/:id
 * Update student information
 * Body: { fields to update }
 * Accessible by: Admin, Teacher, or the student updating their own profile
 */
router.put('/:id', async (req, res, next) => {
  // Check if student is updating their own profile
  if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own profile',
    });
  }
  // Allow admin, teacher, or the user themselves
  if (req.user.role === 'admin' || req.user.role === 'teacher' || req.user._id.toString() === req.params.id) {
    return next();
  }
  res.status(403).json({
    success: false,
    error: 'Not authorized to update this student',
  });
}, updateStudent);

// ============================================
// DELETE ROUTES
// ============================================

/**
 * DELETE /api/students/:id
 * Soft delete a student (mark as inactive)
 * Query params: hardDelete (true for permanent deletion - admin only)
 * Accessible by: Admin, Teacher
 */
router.delete('/:id', authorize('admin', 'teacher'), deleteStudent);

module.exports = router;