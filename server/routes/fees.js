const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createFee,
    getStudentFees,
    updateFeeStatus,
    getFeeStatistics
} = require('../controllers/feeController');

// All routes require authentication
router.use(auth);

// Create fee record (Admin only)
router.post('/', authorize('admin'), createFee);

// Get fee records
router.get('/', getStudentFees);

// Update fee status (Admin only)
router.put('/:id', authorize('admin'), updateFeeStatus);

// Get fee statistics (Admin only)
router.get('/stats', authorize('admin'), getFeeStatistics);

module.exports = router;