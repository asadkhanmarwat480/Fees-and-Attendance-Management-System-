import { useState } from 'react';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    InputAdornment,
    IconButton,
    CircularProgress,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    LoginOutlined,
    AccountCircle,
    Lock
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../API/api';
import { endpoints } from '../API/endpoints';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const validateForm = () => {
        const errors = {};
        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user types
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleTogglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const response = await api.post(endpoints.login, formData);
            login(response.data.user, response.data.token);
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to login. Please check your credentials.';
            setError(errorMessage);
            // Shake animation could be added here
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    marginTop: isMobile ? 4 : 8,
                    marginBottom: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 2,
                        background: theme.palette.background.paper,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            mb: 3,
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                mb: 1,
                            }}
                        >
                            Welcome Back
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Please sign in to continue
                        </Typography>
                    </Box>

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                mb: 2,
                                animation: 'slideIn 0.3s ease-out',
                            }}
                            onClose={() => setError('')}
                        >
                            {error}
                        </Alert>
                    )}

                    {location.state?.message && (
                        <Alert 
                            severity="success" 
                            sx={{ mb: 2 }}
                            onClose={() => {
                                navigate(location.pathname, { replace: true, state: {} });
                            }}
                        >
                            {location.state.message}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit}
                        sx={{ mt: 1 }}
                        noValidate
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                            error={!!formErrors.username}
                            helperText={formErrors.username}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <AccountCircle color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={handleChange}
                            error={!!formErrors.password}
                            helperText={formErrors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleTogglePassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.2,
                                position: 'relative',
                            }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px',
                                    }}
                                />
                            ) : (
                                <>
                                    <LoginOutlined sx={{ mr: 1 }} />
                                    Sign In
                                </>
                            )}
                        </Button>

                        <Divider sx={{ my: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                OR
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Don't have an account?
                            </Typography>
                            <Link 
                                to="/register" 
                                style={{ 
                                    textDecoration: 'none',
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    Create Account
                                </Button>
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;