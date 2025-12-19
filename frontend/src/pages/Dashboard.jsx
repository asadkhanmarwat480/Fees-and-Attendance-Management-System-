import { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
    CardHeader,
    Button,
    IconButton,
    useTheme,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Avatar,
    LinearProgress,
} from '@mui/material';
import {
    School,
    EventNote,
    Payment,
    Timeline,
    TrendingUp,
    NotificationsActive,
    MoreVert,
    CheckCircle,
    Warning,
    Error,
    CalendarToday,
    AttachMoney,
    Group,
    Class,
    AssignmentTurnedIn,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../API/api';
import { endpoints } from '../API/endpoints';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, icon, color, trend, subtitle }) => {
    const theme = useTheme();
    
    return (
        <Card 
            sx={{ 
                height: '100%',
                position: 'relative',
                overflow: 'visible',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.3s ease-in-out',
                }
            }}
        >
            <CardContent>
                <Box 
                    sx={{ 
                        position: 'absolute',
                        top: -20,
                        left: 20,
                        backgroundColor: color,
                        borderRadius: '50%',
                        width: 56,
                        height: 56,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: theme.shadows[3],
                    }}
                >
                    {icon}
                </Box>
                <Box sx={{ pt: 4 }}>
                    <Typography color="textSecondary" variant="body2" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div" gutterBottom>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography 
                                variant="body2" 
                                color={trend >= 0 ? 'success.main' : 'error.main'}
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                {trend >= 0 ? '+' : ''}{trend}%
                                <TrendingUp 
                                    sx={{ 
                                        ml: 0.5,
                                        transform: trend >= 0 ? 'none' : 'rotate(180deg)'
                                    }} 
                                />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};

const AttendanceChart = ({ data }) => {
    const theme = useTheme();
    
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="present" fill={theme.palette.primary.main} />
                <Bar dataKey="absent" fill={theme.palette.error.main} />
            </BarChart>
        </ResponsiveContainer>
    );
};

const FeesDistributionChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={300}>
        <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <RechartsTooltip />
        </PieChart>
    </ResponsiveContainer>
);

const RecentActivitiesList = ({ activities }) => (
    <List>
        {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
                <ListItem>
                    <ListItemIcon>
                        <Avatar sx={{ bgcolor: activity.color }}>
                            {activity.icon}
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText
                        primary={activity.title}
                        secondary={
                            <Typography variant="body2" color="text.secondary">
                                {activity.timestamp} • {activity.description}
                            </Typography>
                        }
                    />
                </ListItem>
                {index < activities.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
        ))}
    </List>
);

const Dashboard = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const [stats, setStats] = useState({
        totalStudents: 0,
        attendanceToday: 0,
        totalFeesCollected: 0,
        pendingFees: 0,
        studentsTrend: 0,
        attendanceTrend: 0,
        feesTrend: 0
    });
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);
    const [feesDistribution, setFeesDistribution] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch total students and trend
                const studentsRes = await api.get(`${endpoints.students}?limit=1`);
                
                // Fetch today's attendance and weekly data
                const today = new Date().toISOString().split('T')[0];
                const attendanceRes = await api.get(
                    `${endpoints.attendanceStats}?date=${today}`
                );
                
                // Fetch attendance for last 7 days
                const weeklyAttendance = await api.get(
                    `${endpoints.attendanceStats}?range=week`
                );
                
                // Fetch fee statistics and distribution
                const feesRes = await api.get(endpoints.feeStats);
                
                // Fetch recent activities
                const activitiesRes = await api.get(`${endpoints.students}/activities`);

                // Process weekly attendance data
                const attendanceChartData = weeklyAttendance.data.map(day => ({
                    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
                    present: day.presentPercentage,
                    absent: 100 - day.presentPercentage
                }));

                // Process fees distribution data
                const feesChartData = [
                    { name: 'Paid', value: feesRes.data.paid?.amount || 0 },
                    { name: 'Pending', value: feesRes.data.pending?.amount || 0 },
                    { name: 'Overdue', value: feesRes.data.overdue?.amount || 0 }
                ];

                // Process recent activities
                const activities = activitiesRes.data.map(activity => ({
                    id: activity.id,
                    title: activity.title,
                    description: activity.description,
                    timestamp: new Date(activity.timestamp).toLocaleString(),
                    icon: getActivityIcon(activity.type),
                    color: getActivityColor(activity.type)
                }));

                setStats({
                    totalStudents: studentsRes.data.totalStudents || 0,
                    attendanceToday: attendanceRes.data[0]?.present || 0,
                    totalFeesCollected: feesRes.data.paid?.amount || 0,
                    pendingFees: feesRes.data.pending?.amount || 0,
                    studentsTrend: 5.2, // Example trend value
                    attendanceTrend: 3.8,
                    feesTrend: -2.4
                });

                setAttendanceData(attendanceChartData);
                setFeesDistribution(feesChartData);
                setRecentActivities(activities);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'attendance':
                return <EventNote />;
            case 'payment':
                return <Payment />;
            case 'registration':
                return <School />;
            default:
                return <AssignmentTurnedIn />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'attendance':
                return theme.palette.primary.main;
            case 'payment':
                return theme.palette.success.main;
            case 'registration':
                return theme.palette.secondary.main;
            default:
                return theme.palette.info.main;
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
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={3}
            >
                <Box>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        Dashboard
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back, {user.firstName}! Here's what's happening today.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<NotificationsActive />}
                    color="secondary"
                >
                    Daily Report
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Students"
                        value={stats.totalStudents}
                        icon={<School sx={{ color: '#fff' }} />}
                        color={theme.palette.primary.main}
                        trend={stats.studentsTrend}
                        subtitle="vs last month"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Today's Attendance"
                        value={`${stats.attendanceToday}%`}
                        icon={<EventNote sx={{ color: '#fff' }} />}
                        color={theme.palette.success.main}
                        trend={stats.attendanceTrend}
                        subtitle="vs last week"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Fees Collected"
                        value={`$${stats.totalFeesCollected.toLocaleString()}`}
                        icon={<Payment sx={{ color: '#fff' }} />}
                        color={theme.palette.info.main}
                        trend={stats.feesTrend}
                        subtitle="vs last month"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Pending Fees"
                        value={`$${stats.pendingFees.toLocaleString()}`}
                        icon={<Timeline sx={{ color: '#fff' }} />}
                        color={theme.palette.warning.main}
                    />
                </Grid>

                {/* Charts Section */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Weekly Attendance Overview</Typography>
                            <IconButton size="small">
                                <MoreVert />
                            </IconButton>
                        </Box>
                        <AttendanceChart data={attendanceData} />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Fees Distribution</Typography>
                            <IconButton size="small">
                                <MoreVert />
                            </IconButton>
                        </Box>
                        <FeesDistributionChart data={feesDistribution} />
                    </Paper>
                </Grid>

                {/* Recent Activities */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Typography variant="h6">Recent Activities</Typography>
                            <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<CalendarToday />}
                            >
                                View All
                            </Button>
                        </Box>
                        <RecentActivitiesList activities={recentActivities} />
                    </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12}>
                    <Box display="flex" gap={2} sx={{ overflowX: 'auto', pb: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Group />}
                            onClick={() => navigate('/students')}
                        >
                            Manage Students
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<Class />}
                            onClick={() => navigate('/attendance')}
                        >
                            Mark Attendance
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AttachMoney />}
                            onClick={() => navigate('/fees')}
                        >
                            Collect Fees
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AssignmentTurnedIn />}
                        >
                            Generate Reports
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;