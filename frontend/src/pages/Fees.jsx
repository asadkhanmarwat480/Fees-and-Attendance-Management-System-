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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Chip,
} from '@mui/material';
import {
    Payment as PaymentIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../API/api';
import { endpoints } from '../API/endpoints';

const Fees = () => {
    const { user, isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [fees, setFees] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [students, setStudents] = useState([]);
    const [formData, setFormData] = useState({
        studentId: '',
        amount: '',
        type: 'tuition',
        semester: '',
        dueDate: '',
        status: 'pending',
        paymentMethod: 'cash',
        remarks: '',
    });

    useEffect(() => {
        fetchFees();
        if (isAdmin) {
            fetchStudents();
        }
    }, [isAdmin]);

    const fetchFees = async () => {
        try {
            const params = isAdmin ? '' : `?studentId=${user._id}`;
            const response = await api.get(`${endpoints.fees}${params}`);
            setFees(response.data);
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get(endpoints.students);
            setStudents(response.data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleOpenDialog = (fee = null) => {
        if (fee) {
            setSelectedFee(fee);
            setFormData({
                studentId: fee.student._id,
                amount: fee.amount,
                type: fee.type,
                semester: fee.semester,
                dueDate: fee.dueDate.split('T')[0],
                status: fee.status,
                paymentMethod: fee.paymentMethod || 'cash',
                remarks: fee.remarks || '',
            });
        } else {
            setSelectedFee(null);
            setFormData({
                studentId: '',
                amount: '',
                type: 'tuition',
                semester: '',
                dueDate: '',
                status: 'pending',
                paymentMethod: 'cash',
                remarks: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedFee(null);
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedFee) {
                await api.put(`${endpoints.fees}/${selectedFee._id}`, formData);
            } else {
                await api.post(endpoints.fees, formData);
            }
            handleCloseDialog();
            fetchFees();
        } catch (error) {
            console.error('Error saving fee:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Fees Management</Typography>
                {isAdmin && (
                    <Button
                        variant="contained"
                        startIcon={<PaymentIcon />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Fee Record
                    </Button>
                )}
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Student</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Due Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fees.map((fee) => (
                            <TableRow key={fee._id}>
                                <TableCell>
                                    {`${fee.student.userId.firstName} ${fee.student.userId.lastName}`}
                                </TableCell>
                                <TableCell>{fee.type}</TableCell>
                                <TableCell>${fee.amount}</TableCell>
                                <TableCell>
                                    {new Date(fee.dueDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={fee.status.toUpperCase()}
                                        color={getStatusColor(fee.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {isAdmin ? (
                                        <Button
                                            size="small"
                                            startIcon={<PaymentIcon />}
                                            onClick={() => handleOpenDialog(fee)}
                                        >
                                            Update
                                        </Button>
                                    ) : (
                                        <Button
                                            size="small"
                                            startIcon={<ReceiptIcon />}
                                            disabled={fee.status !== 'paid'}
                                        >
                                            Receipt
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add/Edit Fee Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>
                        {selectedFee ? 'Update Fee Record' : 'Add New Fee Record'}
                    </DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Student"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {students.map((student) => (
                                        <MenuItem key={student._id} value={student._id}>
                                            {`${student.userId.firstName} ${student.userId.lastName}`}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="tuition">Tuition</MenuItem>
                                    <MenuItem value="exam">Exam</MenuItem>
                                    <MenuItem value="laboratory">Laboratory</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Amount"
                                    name="amount"
                                    type="number"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Semester"
                                    name="semester"
                                    type="number"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Due Date"
                                    name="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={handleInputChange}
                                    required
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="paid">Paid</MenuItem>
                                    <MenuItem value="overdue">Overdue</MenuItem>
                                </TextField>
                            </Grid>
                            {formData.status === 'paid' && (
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Payment Method"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <MenuItem value="cash">Cash</MenuItem>
                                        <MenuItem value="online">Online</MenuItem>
                                        <MenuItem value="cheque">Cheque</MenuItem>
                                    </TextField>
                                </Grid>
                            )}
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Remarks"
                                    name="remarks"
                                    multiline
                                    rows={3}
                                    value={formData.remarks}
                                    onChange={handleInputChange}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {selectedFee ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Fees;