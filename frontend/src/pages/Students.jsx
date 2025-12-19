/**
 * Students Page - Complete Student Management Dashboard
 * Features: List view with table, search, filters, pagination, CRUD operations
 * Uses Material-UI components for modern, responsive design
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Skeleton,
  Card,
  CardContent,
  Typography,
  Tooltip,
  Alert,
  Grid as MuiGrid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  FileDownload,
  Search,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../API/api';
import StudentForm from '../components/StudentForm';

/**
 * StudentList Component
 * Displays all students in a table with search, filter, and pagination
 */
const StudentList = ({
  students,
  loading,
  onEdit,
  onDelete,
  onView,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getStatusColor = (status) => {
    const colorMap = {
      active: 'success',
      inactive: 'default',
      transferred: 'warning',
      graduated: 'info',
    };
    return colorMap[status] || 'default';
  };

  const getStatusIcon = (status) => {
    return status === 'active' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />;
  };

  return (
    <Box sx={{ mt: 3 }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          overflow: isMobile ? 'auto' : 'unset',
        }}
      >
        {loading ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
            ))}
          </Box>
        ) : students.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="textSecondary">No students found</Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Section</TableCell>
                  {!isMobile && (
                    <>
                      <TableCell sx={{ fontWeight: 600, color: 'white' }}>Parent</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'white' }}>Phone</TableCell>
                    </>
                  )}
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map(student => (
                  <TableRow
                    key={student._id}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'light'
                          ? 'rgba(79, 70, 229, 0.05)'
                          : 'rgba(79, 70, 229, 0.1)',
                      },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{student.rollNo}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {student.photoUrl && (
                          <img
                            src={student.photoUrl}
                            alt={student.fullName}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                          />
                        )}
                        {student.fullName}
                      </Box>
                    </TableCell>
                    <TableCell>{student.className}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{student.parentName}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{student.parentPhone}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(student.status)}
                        label={student.status}
                        color={getStatusColor(student.status)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => onView(student._id)}
                          sx={{ color: 'primary.main' }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(student._id)}
                          sx={{ color: 'warning.main' }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => onDelete(student._id)}
                          sx={{ color: 'error.main' }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={pagination.totalStudents}
              rowsPerPage={pagination.studentsPerPage}
              page={pagination.currentPage - 1}
              onPageChange={(e, newPage) => onPageChange(newPage + 1)}
              onRowsPerPageChange={e => onLimitChange(e.target.value)}
            />
          </>
        )}
      </TableContainer>
    </Box>
  );
};

/**
 * StudentFilters Component
 * Provides search and filter controls
 */
const StudentFilters = ({ onSearch, onFilterChange, filters, onExport, loading }) => {
  const theme = useTheme();

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
    'Class 11',
    'Class 12',
  ];
  const sections = ['A', 'B', 'C', 'D', 'E'];
  const statuses = ['active', 'inactive', 'transferred', 'graduated', 'all'];

  return (
    <Card sx={{ mb: 3, borderRadius: '8px' }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* Search Bar */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              placeholder="Search by name, roll number, parent name or phone..."
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
              }}
              onChange={e => onSearch(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                },
              }}
            />
          </Grid>

          {/* Filter Controls */}
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Class</InputLabel>
              <Select
                value={filters.className || ''}
                label="Class"
                onChange={e => onFilterChange('className', e.target.value)}
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map(cls => (
                  <MenuItem key={cls} value={cls}>
                    {cls}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Section</InputLabel>
              <Select
                value={filters.section || ''}
                label="Section"
                onChange={e => onFilterChange('section', e.target.value)}
              >
                <MenuItem value="">All Sections</MenuItem>
                {sections.map(sec => (
                  <MenuItem key={sec} value={sec}>
                    {sec}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Gender</InputLabel>
              <Select
                value={filters.gender || ''}
                label="Gender"
                onChange={e => onFilterChange('gender', e.target.value)}
              >
                <MenuItem value="">All Genders</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || 'active'}
                label="Status"
                onChange={e => onFilterChange('status', e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="transferred">Transferred</MenuItem>
                <MenuItem value="graduated">Graduated</MenuItem>
                <MenuItem value="all">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={12} md={2.4}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FileDownload />}
              onClick={onExport}
              disabled={loading}
              sx={{
                height: '40px',
                textTransform: 'none',
              }}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

/**
 * DeleteConfirmationDialog Component
 */
const DeleteConfirmationDialog = ({ open, student, onConfirm, onCancel, loading }) => {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Delete sx={{ color: 'error.main' }} />
        Delete Student
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This will move the student to inactive status (soft delete). The data can be recovered later.
        </Alert>
        <Typography>
          Are you sure you want to delete <strong>{student?.fullName}</strong> (Roll No: {student?.rollNo})?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : undefined}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * Main Students Page Component
 */
const Students = () => {
  const theme = useTheme();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    studentsPerPage: 10,
  });
  const [filters, setFilters] = useState({
    className: '',
    section: '',
    gender: '',
    status: 'active',
    search: '',
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    student: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.studentsPerPage,
        ...(filters.className && { className: filters.className }),
        ...(filters.section && { section: filters.section }),
        ...(filters.gender && { gender: filters.gender }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await api.get(`/students?${params}`);

      if (response.data.success) {
        setStudents(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.studentsPerPage, filters]);

  // Fetch students on mount and when filters change
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Handle search
  const handleSearch = useCallback(value => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle filter change
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  // Handle delete
  const handleDeleteClick = useCallback(
    studentId => {
      const student = students.find(s => s._id === studentId);
      setDeleteDialog({
        open: true,
        student,
      });
    },
    [students]
  );

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/students/${deleteDialog.student._id}`);
      setSuccess('Student deleted successfully');
      setDeleteDialog({ open: false, student: null });
      fetchStudents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete student');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.className && { className: filters.className }),
        ...(filters.section && { section: filters.section }),
      });

      const response = await api.get(`/students/export?${params}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setSuccess('Students exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to export students');
    }
  };

  // Handle form open/close
  const handleOpenForm = (student = null) => {
    setEditingStudent(student);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingStudent(null);
    setFormOpen(false);
  };

  const handleFormSuccess = () => {
    setSuccess('Student saved successfully');
    handleCloseForm();
    fetchStudents();
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle view student profile
  const handleViewStudent = (studentId) => {
    navigate(`/students/${studentId}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Student Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage all students, view details, and perform actions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
          sx={{
            textTransform: 'none',
            px: 3,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          Add New Student
        </Button>
      </Box>

      {/* Error/Success Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <StudentFilters
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        filters={filters}
        onExport={handleExport}
        loading={loading}
      />

      {/* Student List */}
      <StudentList
        students={students}
        loading={loading}
        onEdit={(studentId) => {
          const student = students.find(s => s._id === studentId);
          handleOpenForm(student);
        }}
        onDelete={handleDeleteClick}
        onView={handleViewStudent}
        pagination={pagination}
        onPageChange={page => setPagination(prev => ({ ...prev, currentPage: page }))}
        onLimitChange={limit =>
          setPagination(prev => ({
            ...prev,
            studentsPerPage: parseInt(limit),
            currentPage: 1,
          }))
        }
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialog.open}
        student={deleteDialog.student}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, student: null })}
        loading={deleteLoading}
      />

      {/* Student Form Modal */}
      <StudentForm
        open={formOpen}
        onClose={handleCloseForm}
        student={editingStudent}
        onSuccess={handleFormSuccess}
      />
    </Container>
  );
};

export default Students;