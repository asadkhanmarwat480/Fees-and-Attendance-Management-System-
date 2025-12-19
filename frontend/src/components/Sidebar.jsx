import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Box
} from '@mui/material';
import {
    Dashboard,
    Person,
    School,
    Payment,
    EventNote
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
    const navigate = useNavigate();
    const { isAdmin, isTeacher } = useAuth();

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'teacher', 'student'] },
        { text: 'Students', icon: <School />, path: '/students', roles: ['admin', 'teacher'] },
        { text: 'Attendance', icon: <EventNote />, path: '/attendance', roles: ['admin', 'teacher', 'student'] },
        { text: 'Fees', icon: <Payment />, path: '/fees', roles: ['admin', 'student'] },
        { text: 'Profile', icon: <Person />, path: '/profile', roles: ['admin', 'teacher', 'student'] },
    ];

    const drawer = (
        <div>
            <Toolbar />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        component="button"
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{
                            display: (isAdmin || isTeacher || item.roles.includes('student')) ? 'flex' : 'none',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%'
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
            >
                {drawer}
            </Drawer>
            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                    },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
};

export default Sidebar;