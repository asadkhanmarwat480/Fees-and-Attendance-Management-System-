import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  TextField,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Badge,
  Alert,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import api from "../API/api";
import { endpoints } from "../API/endpoints";

// TabPanel component for tab content
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`profile-tabpanel-${index}`}
    aria-labelledby={`profile-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const Profile = () => {
  const { user, login } = useAuth();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: user?.department || "",
    role: user?.role || "",
  });
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch user activities
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      try {
        const response = await api.get(
          `${endpoints.users}/${user._id}/activities`
        );
        // Ensure we're setting an array, even if empty
        setActivities(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        setActivities([]); // Set empty array on error
      } finally {
        setIsLoadingActivities(false);
      }
    };
    if (user?._id) {
      fetchActivities();
    }
  }, [user?._id]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `${endpoints.users}/${user._id}`,
        formData
      );
      login({ ...user, ...response.data }); // Update user context
      setSuccess("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.put(`${endpoints.users}/${user._id}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Profile Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                editMode ? (
                  <IconButton
                    size="small"
                    sx={{ bgcolor: theme.palette.secondary.main }}
                    onClick={() => setEditMode(false)}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <IconButton
                    size="small"
                    sx={{ bgcolor: theme.palette.secondary.main }}
                    onClick={() => setEditMode(true)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                )
              }
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  border: "4px solid white",
                }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </Badge>
          </Grid>
          <Grid item xs>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {user?.firstName} {user?.lastName}
            </Typography>
            <Typography variant="subtitle1">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} •{" "}
              {user?.department}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Success/Error Messages */}
      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess("")} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Profile Content */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab icon={<SettingsIcon />} label="Profile Details" />
          <Tab icon={<SecurityIcon />} label="Security" />
          <Tab icon={<HistoryIcon />} label="Activity" />
        </Tabs>

        {/* Profile Details Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editMode}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={formData.department}
                disabled
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                disabled
                margin="normal"
              />
            </Grid>
            {editMode && (
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => setEditMode(false)}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleUpdateProfile}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <SaveIcon />
                    }
                    disabled={loading}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={activeTab} index={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    onClick={handleUpdatePassword}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <SecurityIcon />
                      )
                    }
                    disabled={loading}
                  >
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Activity Tab */}
        <TabPanel value={activeTab} index={2}>
          {isLoadingActivities ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : activities.length === 0 ? (
            <Box textAlign="center" p={3}>
              <Typography color="text.secondary">
                No activities to display
              </Typography>
            </Box>
          ) : (
            <List>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id || index}>
                  <ListItem>
                    <ListItemIcon>
                      {activity.type === "attendance" && (
                        <EventIcon color="primary" />
                      )}
                      {activity.type === "payment" && (
                        <PaymentIcon color="success" />
                      )}
                      {activity.type === "submission" && (
                        <AssignmentIcon color="info" />
                      )}
                      {activity.type === "completion" && (
                        <CheckCircleIcon color="secondary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.title}
                      secondary={
                        <>
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'No date'}
                          {activity.description && (
                            <Typography
                              component="div"
                              variant="body2"
                              color="text.secondary"
                            >
                              {activity.description}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < activities.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Attendance Rate
              </Typography>
              <Typography variant="h4">95%</Typography>
              <Typography variant="body2" color="success.main">
                +2.5% from last month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Fees Status
              </Typography>
              <Typography variant="h4">Paid</Typography>
              <Typography variant="body2" color="text.secondary">
                Next due: Jan 15, 2026
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Active Sessions
              </Typography>
              <Typography variant="h4">4/5</Typography>
              <Typography variant="body2" color="text.secondary">
                Current Semester Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
