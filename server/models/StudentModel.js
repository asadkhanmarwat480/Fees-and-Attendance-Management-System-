/**
 * Student Model
 * Handles all student data with validations, indexes, and virtual fields
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // Basic Information
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      lowercase: true,
      sparse: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },

    // Class & Section Information
    className: {
      type: String,
      required: [true, 'Class is required'],
      enum: {
        values: [
          'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
          'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
          'Class 11', 'Class 12',
        ],
        message: 'Invalid class selection',
      },
    },

    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: {
        values: ['A', 'B', 'C', 'D', 'E'],
        message: 'Section must be A, B, C, D, or E',
      },
    },

    rollNo: {
      type: Number,
      required: [true, 'Roll number is required'],
      unique: true,
      sparse: true,
      index: true,
    },

    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: ['Male', 'Female', 'Other'],
        message: 'Gender must be Male, Female, or Other',
      },
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },

    // Parent/Guardian Information
    parentName: {
      type: String,
      required: [true, 'Parent/Guardian name is required'],
      trim: true,
    },

    parentPhone: {
      type: String,
      required: [true, 'Parent phone number is required'],
      match: [/^[+]?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },

    emergencyPhone: {
      type: String,
      match: [/^[+]?[0-9]{10,15}$/, 'Please provide a valid phone number'],
    },

    // Address Information
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },

    // Photo URL (Cloudinary or local storage)
    photoUrl: {
      type: String,
      default: null,
    },

    // Status (active, inactive for soft delete)
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'transferred', 'graduated'],
        message: 'Invalid status',
      },
      default: 'active',
      index: true,
    },

    // Department reference (if using multi-department system)
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    // Soft delete timestamp
    deletedAt: {
      type: Date,
      default: null,
      sparse: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for performance
studentSchema.index({ fullName: 'text', parentName: 'text' }); // Text search
studentSchema.index({ className: 1, section: 1, status: 1 }); // Class & section lookup
studentSchema.index({ createdAt: -1 }); // Recent students
studentSchema.index({ deletedAt: 1 }); // Soft delete queries

// Virtual field for age
studentSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  let age = today.getFullYear() - this.dateOfBirth.getFullYear();
  const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
    age--;
  }
  return age;
});

// Middleware: Don't return deleted students by default
studentSchema.query.active = function() {
  return this.where({ deletedAt: null });
};

// Middleware: Before saving, ensure email uniqueness if provided
studentSchema.pre('save', async function(next) {
  if (this.isModified('email') && this.email) {
    const existingEmail = await mongoose.model('Student').findOne({
      email: this.email,
      _id: { $ne: this._id },
      deletedAt: null,
    });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }
  next();
});

// Middleware: Before updating, validate roll number uniqueness
studentSchema.pre('findByIdAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.rollNo) {
    const existingRoll = await mongoose.model('Student').findOne({
      rollNo: update.rollNo,
      _id: { $ne: this.getFilter()._id },
      deletedAt: null,
    });
    if (existingRoll) {
      throw new Error('Roll number already exists');
    }
  }
  next();
});

// Method: Soft delete
studentSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'inactive';
  return this.save();
};

// Method: Restore soft-deleted student
studentSchema.methods.restore = function() {
  this.deletedAt = null;
  this.status = 'active';
  return this.save();
};

// Static method: Get next available roll number for a class
studentSchema.statics.getNextRollNo = async function(className, section) {
  const lastStudent = await this.findOne({
    className,
    section,
    deletedAt: null,
  })
    .sort({ rollNo: -1 })
    .lean();

  return lastStudent ? lastStudent.rollNo + 1 : 101;
};

module.exports = mongoose.model('Student', studentSchema);
