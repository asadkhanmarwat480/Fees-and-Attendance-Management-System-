const Attendance = require('../models/Attendance');
const Student = require('../models/StudentModel');

// Mark attendance
const markAttendance = async (req, res) => {
    try {
        const { studentId, date, status, subject, remarks } = req.body;

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check for duplicate attendance
        const existingAttendance = await Attendance.findOne({
            student: studentId,
            date: new Date(date),
            subject
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked for this date and subject' });
        }

        const attendance = new Attendance({
            student: studentId,
            date: new Date(date),
            status,
            subject,
            remarks,
            markedBy: req.user._id
        });

        await attendance.save();

        res.status(201).json({
            message: 'Attendance marked successfully',
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error marking attendance', error: error.message });
    }
};

// Get attendance by date range
const getAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, studentId, subject } = req.query;
        
        let query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (studentId) query.student = studentId;
        if (subject) query.subject = subject;

        const attendance = await Attendance.find(query)
            .populate('student', 'rollNumber')
            .populate('markedBy', 'username')
            .sort({ date: -1 });

        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance', error: error.message });
    }
};

// Update attendance
const updateAttendance = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        
        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { $set: { status, remarks } },
            { new: true, runValidators: true }
        )
        .populate('student', 'rollNumber')
        .populate('markedBy', 'username');

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        res.json({
            message: 'Attendance updated successfully',
            attendance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating attendance', error: error.message });
    }
};

// Get attendance statistics
const getAttendanceStats = async (req, res) => {
    try {
        const { studentId, subject, startDate, endDate } = req.query;

        const match = {
            student: studentId ? mongoose.Types.ObjectId(studentId) : { $exists: true }
        };

        if (subject) match.subject = subject;
        if (startDate && endDate) {
            match.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const stats = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$student',
                    totalClasses: { $sum: 1 },
                    present: {
                        $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] }
                    },
                    absent: {
                        $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] }
                    },
                    late: {
                        $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    totalClasses: 1,
                    present: 1,
                    absent: 1,
                    late: 1,
                    attendancePercentage: {
                        $multiply: [
                            { $divide: ['$present', '$totalClasses'] },
                            100
                        ]
                    }
                }
            }
        ]);

        if (studentId && stats.length === 0) {
            return res.status(404).json({ message: 'No attendance records found' });
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching attendance statistics', error: error.message });
    }
};

module.exports = {
    markAttendance,
    getAttendanceByDateRange,
    updateAttendance,
    getAttendanceStats
};