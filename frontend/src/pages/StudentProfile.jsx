/**
 * StudentProfile Component - Detailed view of a single student
 * Features: Tabbed interface, attendance summary, fee summary, profile editing
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  TextField,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Phone,
  Email,
  LocationOn,
  Person,
  School,
  AssignmentTurnedIn,
  CreditCard,
  MoreVert,
} from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../API/api';

/**
 * TabPanel Helper Component
 */
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

/**
 * StudentProfile Component
 */
const StudentProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [updating, setUpdating] = useState(false);

  // Fetch student data
  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${id}`);
      if (response.data.success) {
        setStudent(response.data.data);
        setEditData(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load student');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (e, newValue) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    setEditMode(true);
    setEditData({ ...student });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      setUpdating(true);
      await api.put(`/students/${id}`, editData);
      setStudent(editData);
      setEditMode(false);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update student');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${id}`);
      navigate('/students');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete student');
    }
    setDeleteDialog(false);
  };

  const getStatusColor = status => {
    const colors = {
      active: 'success',
      inactive: 'default',
      transferred: 'warning',
      graduated: 'info',
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!student) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Student not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/students')}
          variant="text"
        >
          Back to Students
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Student Header Card */}
      <Card sx={{ mb: 3, borderRadius: '8px' }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            height: '150px',
            position: 'relative',
          }}
        />

        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Student Avatar */}
            <Box sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
              <Avatar
                src={student.photoUrl}
                alt={student.fullName}
                sx={{ width: 120, height: 120, border: `4px solid white` }}
              >
                {student.fullName.charAt(0)}
              </Avatar>
            </Box>

            {/* Student Basic Info */}
            <Box sx={{ flex: 1, pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {student.fullName}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Roll No: ${student.rollNo}`}
                      variant="outlined"
                      icon={<School />}
                    />
                    <Chip
                      label={`${student.className} - ${student.section}`}
                      variant="outlined"
                      icon={<School />}
                    />
                    <Chip
                      label={student.status}
                      color={getStatusColor(student.status)}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                {/* Action Buttons */}
                {!editMode && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      startIcon={<EditIcon />}
                      variant="contained"
                      onClick={handleEdit}
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => setDeleteDialog(true)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Personal Information" icon={<Person />} iconPosition="start" />
            <Tab label="Parent Information" icon={<Person />} iconPosition="start" />
            <Tab label="Attendance" icon={<AssignmentTurnedIn />} iconPosition="start" />
            <Tab label="Fees" icon={<CreditCard />} iconPosition="start" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Tab 1: Personal Information */}
          <TabPanel value={tabValue} index={0}>
            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={editData.fullName}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    name="gender"
                    value={editData.gender}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    value={editData.dateOfBirth?.split('T')[0] || ''}
                    onChange={handleEditChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={updating}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Email Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Email fontSize="small" />
                    <Typography>{student.email || 'Not provided'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Gender
                  </Typography>
                  <Typography sx={{ mt: 1 }}>{student.gender || 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Date of Birth
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Age
                  </Typography>
                  <Typography sx={{ mt: 1 }}>
                    {student.age ? `${student.age} years` : 'Not calculated'}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Tab 2: Parent Information */}
          <TabPanel value={tabValue} index={1}>
            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Parent/Guardian Name"
                    name="parentName"
                    value={editData.parentName}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Parent Phone"
                    name="parentPhone"
                    value={editData.parentPhone}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Emergency Phone"
                    name="emergencyPhone"
                    value={editData.emergencyPhone}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    multiline
                    rows={3}
                    value={editData.address}
                    onChange={handleEditChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      onClick={handleSaveEdit}
                      disabled={updating}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Parent/Guardian Name
                  </Typography>
                  <Typography sx={{ mt: 1, fontWeight: 600 }}>
                    {student.parentName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Parent Phone
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Phone fontSize="small" />
                    <Typography>{student.parentPhone}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="textSecondary">
                    Emergency Phone
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <Phone fontSize="small" />
                    <Typography>{student.emergencyPhone || 'Not provided'}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="textSecondary">
                    Address
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1 }}>
                    <LocationOn fontSize="small" sx={{ mt: 0.5 }} />
                    <Typography>{student.address}</Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          {/* Tab 3: Attendance Summary */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    85%
                  </Typography>
                  <Typography variant="caption">Attendance Rate</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    34/40
                  </Typography>
                  <Typography variant="caption">Days Present</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    6/40
                  </Typography>
                  <Typography variant="caption">Days Absent</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              Recent Attendance Records
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { date: '2024-01-15', status: 'Present', remarks: 'Regular' },
                    { date: '2024-01-14', status: 'Present', remarks: 'Regular' },
                    { date: '2024-01-13', status: 'Absent', remarks: 'Sick leave' },
                    { date: '2024-01-12', status: 'Present', remarks: 'Regular' },
                  ].map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'Present' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{record.remarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Tab 4: Fees Summary */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹15,000
                  </Typography>
                  <Typography variant="caption">Total Paid</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹5,000
                  </Typography>
                  <Typography variant="caption">Pending</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: 'white',
                    borderRadius: '8px',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ₹20,000
                  </Typography>
                  <Typography variant="caption">Total Amount</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Typography sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
              Fee Payment History
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableCell sx={{ color: 'white' }}>Date</TableCell>
                    <TableCell sx={{ color: 'white' }}>Amount</TableCell>
                    <TableCell sx={{ color: 'white' }}>Type</TableCell>
                    <TableCell sx={{ color: 'white' }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    { date: '2024-01-10', amount: '₹5,000', type: 'Tuition Fee', status: 'Paid' },
                    { date: '2024-01-05', amount: '₹10,000', type: 'Annual Fee', status: 'Paid' },
                  ].map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{record.amount}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>
                        <Chip label={record.status} color="success" size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Student</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete {student.fullName}? This action will soft-delete the record.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentProfile;
