const Fee = require('../models/Fee');
const Student = require('../models/StudentModel');

// Create fee record
const createFee = async (req, res) => {
    try {
        const {
            studentId, amount, type, semester,
            dueDate, status, paymentMethod, remarks
        } = req.body;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const fee = new Fee({
            student: studentId,
            amount,
            type,
            semester,
            dueDate: new Date(dueDate),
            status,
            paymentMethod,
            remarks,
            ...(status === 'paid' && { paymentDate: new Date() })
        });

        if (status === 'paid') {
            fee.receiptNumber = generateReceiptNumber();
        }

        await fee.save();

        res.status(201).json({
            message: 'Fee record created successfully',
            fee
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating fee record', error: error.message });
    }
};

// Get fee records by student
const getStudentFees = async (req, res) => {
    try {
        const { studentId, semester, status } = req.query;
        
        let query = {};
        if (studentId) query.student = studentId;
        if (semester) query.semester = parseInt(semester);
        if (status) query.status = status;

        const fees = await Fee.find(query)
            .populate('student', 'rollNumber')
            .sort({ createdAt: -1 });

        res.json(fees);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee records', error: error.message });
    }
};

// Update fee status
const updateFeeStatus = async (req, res) => {
    try {
        const { status, paymentMethod, remarks } = req.body;
        
        const fee = await Fee.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        fee.status = status;
        if (status === 'paid' && fee.status !== 'paid') {
            fee.paymentDate = new Date();
            fee.paymentMethod = paymentMethod;
            fee.receiptNumber = generateReceiptNumber();
        }
        if (remarks) fee.remarks = remarks;

        await fee.save();

        res.json({
            message: 'Fee status updated successfully',
            fee
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating fee status', error: error.message });
    }
};

// Get fee statistics
const getFeeStatistics = async (req, res) => {
    try {
        const { startDate, endDate, department } = req.query;

        let matchQuery = {};
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (department) {
            const studentIds = await Student.find({ department })
                .distinct('_id');
            matchQuery.student = { $in: studentIds };
        }

        const stats = await Fee.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const formattedStats = {
            paid: { amount: 0, count: 0 },
            pending: { amount: 0, count: 0 },
            overdue: { amount: 0, count: 0 }
        };

        stats.forEach(stat => {
            formattedStats[stat._id] = {
                amount: stat.totalAmount,
                count: stat.count
            };
        });

        res.json(formattedStats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee statistics', error: error.message });
    }
};

// Helper function to generate receipt number
const generateReceiptNumber = () => {
    return 'RCP' + Date.now() + Math.floor(Math.random() * 1000);
};

module.exports = {
    createFee,
    getStudentFees,
    updateFeeStatus,
    getFeeStatistics
};