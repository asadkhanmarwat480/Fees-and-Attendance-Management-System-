/**
 * Student Service - API client for all student-related operations
 * Centralized API calls with error handling and response formatting
 */

import api from '../API/endpoints';

/**
 * Student API Service
 * Provides methods for all student operations
 */
const studentService = {
  /**
   * Fetch all students with pagination, search, and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (1-indexed)
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.className - Filter by class
   * @param {string} params.section - Filter by section
   * @param {string} params.gender - Filter by gender
   * @param {string} params.status - Filter by status
   * @returns {Promise<Object>} - { data: [], pagination: {} }
   */
  getAllStudents: async (params = {}) => {
    try {
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.className && { className: params.className }),
        ...(params.section && { section: params.section }),
        ...(params.gender && { gender: params.gender }),
        ...(params.status && { status: params.status }),
      }).toString();

      const response = await api.get(`/students?${queryString}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch students');
    }
  },

  /**
   * Fetch single student by ID
   * @param {string} id - Student ID
   * @returns {Promise<Object>} - Student object
   */
  getStudentById: async id => {
    try {
      const response = await api.get(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch student');
    }
  },

  /**
   * Create new student
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} - Created student object
   */
  createStudent: async studentData => {
    try {
      const response = await api.post('/students', studentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create student');
    }
  },

  /**
   * Update existing student
   * @param {string} id - Student ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} - Updated student object
   */
  updateStudent: async (id, updates) => {
    try {
      const response = await api.put(`/students/${id}`, updates);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update student');
    }
  },

  /**
   * Delete student (soft or hard delete)
   * @param {string} id - Student ID
   * @param {boolean} hardDelete - Permanent delete (default: false)
   * @returns {Promise<Object>} - Delete response
   */
  deleteStudent: async (id, hardDelete = false) => {
    try {
      const response = await api.delete(
        `/students/${id}?hardDelete=${hardDelete ? 'true' : 'false'}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to delete student');
    }
  },

  /**
   * Search students in real-time
   * @param {string} query - Search query
   * @param {number} limit - Max results (default: 10)
   * @returns {Promise<Object>} - { data: [] }
   */
  searchStudents: async (query, limit = 10) => {
    try {
      const response = await api.get(
        `/students/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to search students');
    }
  },

  /**
   * Get next available roll number for a class/section
   * @param {string} className - Class name
   * @param {string} section - Section letter
   * @returns {Promise<Object>} - { nextRollNo, className, section }
   */
  getNextRollNumber: async (className, section) => {
    try {
      const response = await api.get(
        `/students/next-roll-number?className=${className}&section=${section}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get roll number');
    }
  },

  /**
   * Restore a soft-deleted student
   * @param {string} id - Student ID
   * @returns {Promise<Object>} - Restored student object
   */
  restoreStudent: async id => {
    try {
      const response = await api.post(`/students/${id}/restore`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to restore student');
    }
  },

  /**
   * Get class statistics (gender distribution, section counts)
   * @param {string} className - Class name
   * @returns {Promise<Object>} - { className, totalStudents, sections: [] }
   */
  getClassStatistics: async className => {
    try {
      const response = await api.get(`/students/class-statistics?className=${className}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch statistics');
    }
  },

  /**
   * Export students to CSV
   * @param {Object} filters - Optional filters
   * @param {string} filters.className - Filter by class
   * @param {string} filters.section - Filter by section
   * @returns {Promise<Blob>} - CSV file blob
   */
  exportStudents: async (filters = {}) => {
    try {
      const params = new URLSearchParams({
        ...(filters.className && { className: filters.className }),
        ...(filters.section && { section: filters.section }),
      }).toString();

      const response = await api.get(`/students/export?${params}`, {
        responseType: 'blob',
      });

      // Create downloadable file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true, message: 'Export completed' };
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to export students');
    }
  },

  /**
   * Bulk validate students before import
   * @param {Array} students - Array of student objects
   * @returns {Object} - { valid: [], invalid: [] }
   */
  validateStudents: (students = []) => {
    const valid = [];
    const invalid = [];

    students.forEach((student, index) => {
      const errors = [];

      if (!student.fullName?.trim()) errors.push('Full name required');
      if (!student.email?.trim()) errors.push('Email required');
      if (!student.className) errors.push('Class required');
      if (!student.section) errors.push('Section required');
      if (!student.parentName?.trim()) errors.push('Parent name required');
      if (!student.parentPhone?.trim()) errors.push('Parent phone required');
      if (!student.address?.trim()) errors.push('Address required');

      if (errors.length === 0) {
        valid.push(student);
      } else {
        invalid.push({ row: index + 1, student, errors });
      }
    });

    return { valid, invalid };
  },

  /**
   * Format student data for display
   * @param {Object} student - Student object from database
   * @returns {Object} - Formatted student object
   */
  formatStudentData: student => {
    return {
      ...student,
      age: student.age || 'N/A',
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : 'N/A',
      fullName: student.fullName || 'Unknown',
      statusLabel: {
        active: 'Active',
        inactive: 'Inactive',
        transferred: 'Transferred',
        graduated: 'Graduated',
      }[student.status] || student.status,
    };
  },

  /**
   * Build filter object from query parameters
   * @param {Object} filters - Filter parameters
   * @returns {Object} - Formatted filter object
   */
  buildFilters: filters => {
    return {
      className: filters.className || '',
      section: filters.section || '',
      gender: filters.gender || '',
      status: filters.status || 'active',
      search: filters.search || '',
    };
  },

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} - True if valid
   */
  isValidEmail: email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format
   * @param {string} phone - Phone number
   * @returns {boolean} - True if valid (10 digits)
   */
  isValidPhone: phone => {
    const phoneDigits = phone.replace(/\D/g, '');
    return phoneDigits.length === 10;
  },

  /**
   * Calculate age from date of birth
   * @param {string} dateOfBirth - Date string (YYYY-MM-DD)
   * @returns {number} - Age in years
   */
  calculateAge: dateOfBirth => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  },

  /**
   * Generate sample student data for testing
   * @param {number} count - Number of students to generate
   * @returns {Array} - Array of sample student objects
   */
  generateSampleData: (count = 5) => {
    const names = [
      'Aarav Kumar',
      'Arjun Singh',
      'Aditya Patel',
      'Vikram Reddy',
      'Rohan Sharma',
      'Priya Verma',
      'Anjali Gupta',
      'Neha Singh',
      'Diya Patel',
      'Pooja Reddy',
    ];
    const classes = [
      'Class 1',
      'Class 2',
      'Class 3',
      'Class 4',
      'Class 5',
      'Class 6',
      'Class 7',
      'Class 8',
      'Class 9',
      'Class 10',
    ];
    const sections = ['A', 'B', 'C', 'D'];
    const genders = ['Male', 'Female'];

    const students = [];
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      const className = classes[Math.floor(Math.random() * classes.length)];
      const section = sections[Math.floor(Math.random() * sections.length)];

      students.push({
        fullName: name,
        email: `${name.toLowerCase().replace(/\s/g, '.')}@school.com`,
        className,
        section,
        gender: genders[Math.floor(Math.random() * genders.length)],
        dateOfBirth: `200${Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
        parentName: `Parent of ${name}`,
        parentPhone: `98${String(Math.floor(Math.random() * 90000000) + 10000000).padStart(8, '0')}`,
        address: `${Math.floor(Math.random() * 1000) + 1} Street Name, City, State 123456`,
      });
    }

    return students;
  },
};

export default studentService;
