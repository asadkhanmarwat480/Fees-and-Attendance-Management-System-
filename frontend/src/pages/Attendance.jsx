import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    TextField,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    AccessTime as LateIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../API/api';
import { endpoints } from '../API/endpoints';

const Attendance = () => {
    const { user, isTeacher, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [subject, setSubject] = useState('');
    const [attendance, setAttendance] = useState({});
    const [subjects] = useState(['Mathematics', 'Physics', 'Chemistry', 'English']); // Replace with actual subjects

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get(endpoints.students);
            const studentsData = response.data.students || response.data || [];
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            fetchAttendance(Array.isArray(studentsData) ? studentsData : []);
        } catch (error) {
            console.error('Error fetching students:', error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async (studentsList) => {
        if (!subject || !selectedDate) return;

        try {
            const date = selectedDate.toISOString().split('T')[0];
            const response = await api.get(
                `${endpoints.attendance}?date=${date}&subject=${subject}`
            );
            
            const attendanceMap = {};
            response.data.forEach((record) => {
                attendanceMap[record.student] = record.status;
            });
            
            setAttendance(attendanceMap);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    const handleMarkAttendance = async (studentId, status) => {
        try {
            await api.post(endpoints.attendance, {
                studentId,
                date: selectedDate.toISOString(),
                status,
                subject,
            });
            
            setAttendance({
                ...attendance,
                [studentId]: status,
            });
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    const getAttendanceColor = (status) => {
        switch (status) {
            case 'present':
                return 'success.main';
            case 'absent':
                return 'error.main';
            case 'late':
                return 'warning.main';
            default:
                return 'text.secondary';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Attendance Management
            </Typography>

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Select Date"
                                value={selectedDate}
                                onChange={(newValue) => {
                                    setSelectedDate(newValue);
                                    fetchAttendance(students);
                                }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={subject}
                                label="Subject"
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    fetchAttendance(students);
                                }}
                            >
                                {subjects.map((sub) => (
                                    <MenuItem key={sub} value={sub}>
                                        {sub}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Roll Number</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Status</TableCell>
                            {(isTeacher || isAdmin) && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students && students.length > 0 && students.map((student) => (
                            <TableRow key={student._id}>
                                <TableCell>{student.rollNumber}</TableCell>
                                <TableCell>
                                    {`${student.userId?.firstName || ''} ${student.userId?.lastName || ''}`}
                                </TableCell>
                                <TableCell>{student.department}</TableCell>
                                <TableCell>
                                    <Typography color={getAttendanceColor(attendance[student._id])}>
                                        {attendance[student._id]?.toUpperCase() || 'Not Marked'}
                                    </Typography>
                                </TableCell>
                                {(isTeacher || isAdmin) && (
                                    <TableCell>
                                        <IconButton
                                            color="success"
                                            onClick={() => handleMarkAttendance(student._id, 'present')}
                                        >
                                            <CheckIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleMarkAttendance(student._id, 'absent')}
                                        >
                                            <CloseIcon />
                                        </IconButton>
                                        <IconButton
                                            color="warning"
                                            onClick={() => handleMarkAttendance(student._id, 'late')}
                                        >
                                            <LateIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Attendance;