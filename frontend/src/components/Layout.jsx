import { Box, CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material';
import { useState, useMemo } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
    const [mobileOpen, setMobileOpen] = useState(false);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: {
                        main: mode === 'dark' ? '#90caf9' : '#1976d2',
                        light: mode === 'dark' ? '#e3f2fd' : '#42a5f5',
                        dark: mode === 'dark' ? '#42a5f5' : '#1565c0',
                    },
                    secondary: {
                        main: mode === 'dark' ? '#f48fb1' : '#dc004e',
                        light: mode === 'dark' ? '#fce4ec' : '#ff4081',
                        dark: mode === 'dark' ? '#ff4081' : '#c51162',
                    },
                    background: {
                        default: mode === 'dark' ? '#121212' : '#f5f5f5',
                        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                    },
                },
                typography: {
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                    h1: { fontWeight: 500 },
                    h2: { fontWeight: 500 },
                    h3: { fontWeight: 500 },
                    h4: { fontWeight: 500 },
                    h5: { fontWeight: 500 },
                    h6: { fontWeight: 500 },
                },
                shape: {
                    borderRadius: 8,
                },
                components: {
                    MuiButton: {
                        styleOverrides: {
                            root: {
                                textTransform: 'none',
                                borderRadius: 8,
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                },
            }),
        [mode]
    );

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const toggleColorMode = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeProvider theme={theme}>
            <Box 
                sx={{ 
                    display: 'flex',
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default
                }}
            >
           
                <CssBaseline />
                <Navbar 
                    onMenuClick={handleDrawerToggle} 
                    colorMode={mode}
                    onToggleColorMode={toggleColorMode}
                />
                <Sidebar
                    mobileOpen={mobileOpen}
                    onDrawerToggle={handleDrawerToggle}
                />
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        width: { sm: `calc(100% - 240px)` },
                        mt: 8,
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 1200,
                            mx: 'auto',
                            mb: 4,
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default Layout;