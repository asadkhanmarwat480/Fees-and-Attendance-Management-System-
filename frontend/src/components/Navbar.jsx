import { 
    AppBar, 
    IconButton, 
    Toolbar, 
    Typography, 
    Box,
    Badge,
    Tooltip,
    useTheme,
    alpha
} from '@mui/material';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    LightMode as LightModeIcon,
    DarkMode as DarkModeIcon,
    School as SchoolIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import UserMenu from './UserMenu';
import { useState } from 'react';

const Navbar = ({ onMenuClick, colorMode, onToggleColorMode }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const [notificationCount, setNotificationCount] = useState(3);

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                color: theme.palette.text.primary,
                boxShadow: theme.shadows[2]
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <SchoolIcon 
                        sx={{ 
                            display: { xs: 'none', sm: 'block' },
                            color: theme.palette.primary.main
                        }} 
                    />
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component="div"
                        sx={{
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 600
                        }}
                    >
                        EduManager Pro
                    </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Toggle notifications">
                        <IconButton 
                            color="inherit" 
                            sx={{ 
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                            }}
                        >
                            <Badge badgeContent={notificationCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
                        <IconButton 
                            onClick={onToggleColorMode}
                            color="inherit"
                            sx={{ 
                                ml: 1,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                            }}
                        >
                            {colorMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <UserMenu user={user} />
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;