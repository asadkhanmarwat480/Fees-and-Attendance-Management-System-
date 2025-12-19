/**
 * StudentForm Component - Multi-step form for adding/editing students
 * Features: Step-by-step form, validation, auto-generate roll number, file upload
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import { ArrowBack, ArrowForward, Save } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import api from '../API/api';
import { endpoints } from '../API/endpoints';

const steps = ['Basic Information', 'Class & Section', 'Parent Information', 'Contact Details'];

/**
 * StudentForm Component
 * Multi-step form with validation for creating/editing students
 */
const StudentForm = ({ open, onClose, student = null, onSuccess }) => {
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    photoUrl: '',

    // Class Info
    className: '',
    section: '',
    rollNo: '',

    // Parent Info
    parentName: '',
    emergencyPhone: '',

    // Contact Details
    parentPhone: '',
    address: '',
  });

  const [nextRollNo, setNextRollNo] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Classes and sections
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
  const genders = ['Male', 'Female', 'Other'];

  // Load student data if editing
  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        gender: student.gender || '',
        photoUrl: student.photoUrl || '',
        className: student.className || '',
        section: student.section || '',
        rollNo: student.rollNo || '',
        parentName: student.parentName || '',
        emergencyPhone: student.emergencyPhone || '',
        parentPhone: student.parentPhone || '',
        address: student.address || '',
      });
      setActiveStep(0);
    }
  }, [student, open]);

  // Fetch next roll number when class/section changes
  useEffect(() => {
    if (formData.className && formData.section && !student) {
      fetchNextRollNumber();
    }
  }, [formData.className, formData.section, student]);

  const fetchNextRollNumber = async () => {
    try {
      const response = await api.get(
        `${endpoints.students}/next-roll-number?className=${formData.className}&section=${formData.section}`
      );
      if (response.data.success) {
        setNextRollNo(response.data.data.nextRollNo);
        setFormData(prev => ({
          ...prev,
          rollNo: response.data.data.nextRollNo.toString(),
        }));
      }
    } catch (error) {
      console.error('Error fetching roll number:', error);
    }
  };

  // Handle input change
  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate current step
  const validateStep = stepIndex => {
    const newErrors = {};

    switch (stepIndex) {
      case 0: // Basic Information
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;

      case 1: // Class & Section
        if (!formData.className) newErrors.className = 'Class is required';
        if (!formData.section) newErrors.section = 'Section is required';
        if (!formData.rollNo) newErrors.rollNo = 'Roll number is required';
        break;

      case 2: // Parent Information
        if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
        if (!formData.emergencyPhone.trim()) {
          newErrors.emergencyPhone = 'Emergency phone is required';
        } else if (!/^\d{10}$/.test(formData.emergencyPhone.replace(/\D/g, ''))) {
          newErrors.emergencyPhone = 'Invalid phone number (10 digits required)';
        }
        break;

      case 3: // Contact Details
        if (!formData.parentPhone.trim()) {
          newErrors.parentPhone = 'Parent phone is required';
        } else if (!/^\d{10}$/.test(formData.parentPhone.replace(/\D/g, ''))) {
          newErrors.parentPhone = 'Invalid phone number (10 digits required)';
        }
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        break;

      default:
        break;
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrev = () => {
    setActiveStep(prev => prev - 1);
  };

  // Handle submit
  const handleSubmit = async () => {
    try {
      if (!validateStep(activeStep)) {
        return;
      }

      setLoading(true);
      setError('');

      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        photoUrl: formData.photoUrl,
        className: formData.className,
        section: formData.section,
        rollNo: formData.rollNo,
        parentName: formData.parentName,
        emergencyPhone: formData.emergencyPhone,
        parentPhone: formData.parentPhone,
        address: formData.address,
      };

      if (student) {
        // Update existing student
        await api.put(`${endpoints.students}/${student._id}`, submitData);
      } else {
        // Create new student
        await api.post(endpoints.students, submitData);
      }

      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  // Render step content
  const renderStepContent = stepIndex => {
    switch (stepIndex) {
      case 0: // Basic Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!formErrors.fullName}
                helperText={formErrors.fullName}
                placeholder="Enter student's full name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                placeholder="student@example.com"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                error={!!formErrors.dateOfBirth}
                helperText={formErrors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  {genders.map(g => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Photo URL (Optional)"
                name="photoUrl"
                value={formData.photoUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/photo.jpg"
              />
            </Grid>
          </Grid>
        );

      case 1: // Class & Section
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.className}>
                <InputLabel>Class</InputLabel>
                <Select
                  name="className"
                  value={formData.className}
                  label="Class"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {classes.map(cls => (
                    <MenuItem key={cls} value={cls}>
                      {cls}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.section}>
                <InputLabel>Section</InputLabel>
                <Select
                  name="section"
                  value={formData.section}
                  label="Section"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">Select Section</MenuItem>
                  {sections.map(sec => (
                    <MenuItem key={sec} value={sec}>
                      {sec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Roll Number"
                name="rollNo"
                type="number"
                value={formData.rollNo}
                onChange={handleInputChange}
                error={!!formErrors.rollNo}
                helperText={
                  formErrors.rollNo || (nextRollNo ? `Auto-generated: ${nextRollNo}` : '')
                }
                disabled={!student && nextRollNo !== null}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                Roll number will be auto-generated based on class and section
              </Typography>
            </Grid>
          </Grid>
        );

      case 2: // Parent Information
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parent/Guardian Name"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                error={!!formErrors.parentName}
                helperText={formErrors.parentName}
                placeholder="Enter parent's full name"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Phone Number"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                error={!!formErrors.emergencyPhone}
                helperText={formErrors.emergencyPhone || 'For emergency contact purposes'}
                placeholder="10-digit phone number"
              />
            </Grid>
          </Grid>
        );

      case 3: // Contact Details
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Parent Phone Number"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                error={!!formErrors.parentPhone}
                helperText={formErrors.parentPhone}
                placeholder="10-digit phone number"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={4}
                value={formData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
                placeholder="Enter complete address"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        {student ? 'Edit Student' : 'Add New Student'}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '300px' }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={loading}
        >
          Cancel
        </Button>

        {activeStep > 0 && (
          <Button
            onClick={handlePrev}
            startIcon={<ArrowBack />}
            disabled={loading}
          >
            Previous
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            endIcon={<ArrowForward />}
            disabled={loading}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            endIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
          >
            {student ? 'Update' : 'Create'} Student
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default StudentForm;
