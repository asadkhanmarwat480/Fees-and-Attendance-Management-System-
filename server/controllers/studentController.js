/**
 * Student Controller
 * Handles all student-related operations: CRUD, search, filter, pagination
 * Uses StudentModel from models/StudentModel.js
 */

const Student = require('../models/StudentModel');

// ============================================
// GET: Fetch all students with search, filters, and pagination
// ============================================
exports.getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      className = '',
      section = '',
      gender = '',
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build filter object
    let filter = { deletedAt: null };

    // Apply status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Apply class filter
    if (className && className !== '') {
      filter.className = className;
    }

    // Apply section filter
    if (section && section !== '') {
      filter.section = section;
    }

    // Apply gender filter
    if (gender && gender !== '') {
      filter.gender = gender;
    }

    // Apply search filter (search in name, roll number, phone, parent name)
    if (search && search.trim() !== '') {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { rollNo: isNaN(parseInt(search)) ? null : parseInt(search) },
        { parentPhone: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const students = await Student.find(filter)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const total = await Student.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalStudents: total,
        studentsPerPage: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching students',
    });
  }
};

// ============================================
// GET: Fetch single student by ID
// ============================================
exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching student',
    });
  }
};

// ============================================
// POST: Create new student
// ============================================
exports.createStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      className,
      section,
      rollNo,
      gender,
      dateOfBirth,
      parentName,
      parentPhone,
      emergencyPhone,
      address,
      photoUrl,
    } = req.body;

    // Validation
    if (!fullName || !className || !section || !parentName || !parentPhone || !address) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: fullName, className, section, parentName, parentPhone, address',
      });
    }

    // Check if roll number already exists (if provided)
    if (rollNo) {
      const existingRoll = await Student.findOne({
        rollNo,
        deletedAt: null,
      });
      if (existingRoll) {
        return res.status(409).json({
          success: false,
          error: 'Roll number already exists',
        });
      }
    }

    // Auto-generate roll number if not provided
    let finalRollNo = rollNo;
    if (!finalRollNo) {
      finalRollNo = await Student.getNextRollNo(className, section);
    }

    // Create new student
    const student = new Student({
      fullName,
      email,
      className,
      section,
      rollNo: finalRollNo,
      gender,
      dateOfBirth,
      parentName,
      parentPhone,
      emergencyPhone,
      address,
      photoUrl,
      status: 'active',
    });

    await student.save();

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate field value entered (email, phone, or rollNo)',
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Error creating student',
    });
  }
};

// ============================================
// PUT: Update student by ID
// ============================================
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fields that should not be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.deletedAt;

    // Validate that there are updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update',
      });
    }

    // Check if roll number is unique (if updating roll number)
    if (updates.rollNo) {
      const student = await Student.findById(id);
      if (student && student.rollNo !== updates.rollNo) {
        const existingRoll = await Student.findOne({
          rollNo: updates.rollNo,
          _id: { $ne: id },
          deletedAt: null,
        });
        if (existingRoll) {
          return res.status(409).json({
            success: false,
            error: 'Roll number already exists',
          });
        }
      }
    }

    // Update timestamp
    updates.updatedAt = new Date();

    const student = await Student.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: 'Student updated successfully',
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate field value entered',
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || 'Error updating student',
    });
  }
};

// ============================================
// DELETE: Soft delete student (default) or hard delete (admin only)
// ============================================
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (hardDelete === 'true' || hardDelete === true) {
      // Hard delete - admin only (add your role-based auth check here)
      // Example: if (req.user.role !== 'admin') return res.status(403).json({error: 'Not authorized'})
      await Student.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'Student permanently deleted',
      });
    }

    // Soft delete (default) - mark as inactive and set deletedAt
    student.deletedAt = new Date();
    student.status = 'inactive';
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Student moved to inactive (soft deleted)',
      data: student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error deleting student',
    });
  }
};

// ============================================
// GET: Search students (real-time, text search)
// ============================================
exports.searchStudents = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Use text index for full-text search
    const students = await Student.find(
      {
        $text: { $search: q },
        deletedAt: null,
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error searching students',
    });
  }
};

// ============================================
// GET: Get next available roll number
// ============================================
exports.getNextRollNumber = async (req, res) => {
  try {
    const { className, section } = req.query;

    if (!className || !section) {
      return res.status(400).json({
        success: false,
        error: 'Class and section are required',
      });
    }

    const nextRollNo = await Student.getNextRollNo(className, section);

    res.status(200).json({
      success: true,
      data: {
        nextRollNo,
        className,
        section,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error getting next roll number',
    });
  }
};

// ============================================
// POST: Restore soft-deleted student
// ============================================
exports.restoreStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: 'Student not found',
      });
    }

    if (!student.deletedAt) {
      return res.status(400).json({
        success: false,
        error: 'Student is not deleted',
      });
    }

    // Restore the student
    student.deletedAt = null;
    student.status = 'active';
    await student.save();

    res.status(200).json({
      success: true,
      data: student,
      message: 'Student restored successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error restoring student',
    });
  }
};

// ============================================
// GET: Get class statistics
// ============================================
exports.getClassStatistics = async (req, res) => {
  try {
    const { className } = req.query;

    if (!className) {
      return res.status(400).json({
        success: false,
        error: 'Class name is required',
      });
    }

    // Get all sections and their student counts
    const stats = await Student.aggregate([
      { $match: { className, deletedAt: null } },
      {
        $group: {
          _id: '$section',
          count: { $sum: 1 },
          maleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'Male'] }, 1, 0] },
          },
          femaleCount: {
            $sum: { $cond: [{ $eq: ['$gender', 'Female'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalStudents = stats.reduce((sum, stat) => sum + stat.count, 0);

    res.status(200).json({
      success: true,
      data: {
        className,
        totalStudents,
        sections: stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error fetching class statistics',
    });
  }
};

// ============================================
// GET: Export students to CSV (bonus feature)
// ============================================
exports.exportStudents = async (req, res) => {
  try {
    const { className, section } = req.query;

    // Build filter
    let filter = { deletedAt: null };
    if (className) filter.className = className;
    if (section) filter.section = section;

    const students = await Student.find(filter).lean();

    // Create CSV header and rows
    const csv = [
      ['Full Name', 'Roll No', 'Class', 'Section', 'Gender', 'Parent', 'Phone', 'Email'].join(','),
      ...students.map(s =>
        [
          s.fullName,
          s.rollNo,
          s.className,
          s.section,
          s.gender,
          s.parentName,
          s.parentPhone,
          s.email || '',
        ]
          .map(field => `"${field || ''}"`)
          .join(',')
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error exporting students',
    });
  }
};