// webxr-directory-frontend/src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
    ThemeProvider,
    createTheme,
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Container,
    Box,
    Link // Import MUI Link for styling consistency
} from '@mui/material';

// Import Page Components (we will create these next)
import HomePage from './pages/HomePage';
import ToolDetailPage from './pages/ToolDetailPage';
import SubmitPage from './pages/SubmitPage';

// --- Basic Material UI Theme ---
// Customize colors, typography, etc. as needed
// Inspired by FutureTools but adapt for an educational feel
const theme = createTheme({
    palette: {
        mode: 'light', // Or 'dark'
        primary: {
            // main: '#1976d2', // Standard MUI blue
            main: '#4A90E2', // A slightly softer, modern blue
            // contrastText: '#ffffff',
        },
        secondary: {
            // main: '#dc004e', // Standard MUI pink
            main: '#50E3C2', // A contrasting teal/mint
            // contrastText: '#000000',
        },
        background: {
            default: '#f4f6f8', // A light grey background
            paper: '#ffffff',   // Background for cards, paper elements
        },
        text: {
            primary: '#333333', // Darker grey for primary text
            secondary: '#666666', // Lighter grey for secondary text
        }
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600, // Make H4 slightly bolder
        },
        h6: {
            fontWeight: 600, // Make H6 slightly bolder
        },
    },
    // --- Component Style Overrides (Optional) ---
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff', // White AppBar background
                    color: '#333333',          // Darker text on AppBar
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px', // More rounded corners for cards
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-4px)', // Lift card slightly on hover
                        boxShadow: '0 6px 12px rgba(0,0,0,0.15)', // More pronounced shadow on hover
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none', // Keep button text case as defined
                    borderRadius: '8px',  // Slightly rounded buttons
                },
                containedPrimary: { // Style for primary contained buttons
                    // color: '#ffffff', // Ensure text is white on primary button
                }
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                     // Adjust chip styles if needed
                }
            }
        }
    },
});

// --- App Component ---
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Apply base styling and resets */}
            <Router>
                {/* Flex container to push footer down */}
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

                    {/* --- Header --- */}
                    <AppBar position="static"> {/* Use static so it doesn't overlay content */}
                        <Container maxWidth="lg"> {/* Constrain width like main content */}
                            <Toolbar disableGutters> {/* Remove default padding */}

                                {/* Site Title/Logo Link */}
                                <Link component={RouterLink} to="/" sx={{
                                    flexGrow: 1, // Take up remaining space
                                    textDecoration: 'none',
                                    color: 'inherit' // Inherit color from AppBar override
                                }}>
                                    <Typography variant="h6" component="div" sx={{ color: theme.palette.primary.main /* Or specific brand color */ }}>
                                        XR Tools For Ed {/* Your Site Name */}
                                    </Typography>
                                </Link>

                                {/* Navigation Links */}
                                <Box sx={{ '& > *': { ml: { xs: 1, sm: 2 } } }}> {/* Spacing between links, responsive */}
                                    <Link component={RouterLink} to="/" color="inherit" sx={{
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        '&:hover': { color: 'primary.main' } // Highlight on hover
                                    }}>
                                        Discover
                                    </Link>
                                    <Link component={RouterLink} to="/submit" color="inherit" sx={{
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        '&:hover': { color: 'primary.main' } // Highlight on hover
                                    }}>
                                        Submit Tool
                                    </Link>
                                    {/* Add more links here if needed (e.g., About, Best Practices) */}
                                </Box>

                            </Toolbar>
                        </Container>
                    </AppBar>

                    {/* --- Main Content Area --- */}
                    {/* Container limits max width and adds padding */}
                    <Container component="main" maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4, flexGrow: 1 }}>
                        <Routes>
                            {/* Define routes and the components they render */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/tool/:id" element={<ToolDetailPage />} /> {/* :id is a URL parameter */}
                            <Route path="/submit" element={<SubmitPage />} />

                            {/* Catch-all 404 Route */}
                            <Route path="*" element={
                                <Typography variant="h4" align="center" sx={{ mt: 5 }}>
                                    404: Page Not Found
                                </Typography>
                            } />
                        </Routes>
                    </Container>

                    {/* --- Footer --- */}
                    <Box component="footer" sx={{
                        py: 3, // Padding top/bottom
                        px: 2, // Padding left/right
                        mt: 'auto', // Push footer to bottom
                        backgroundColor: (theme) =>
                            theme.palette.mode === 'light'
                                ? theme.palette.grey[200]
                                : theme.palette.grey[800],
                    }}>
                        <Container maxWidth="lg">
                            <Typography variant="body2" color="text.secondary" align="center">
                                {'Copyright © '}
                                <Link color="inherit" href="https://your-website.com/"> {/* Optional: Link to your site/portfolio */}
                                    XR Tools For Ed
                                </Link>{' '}
                                {new Date().getFullYear()}
                                {'.'}
                            </Typography>
                            {/* Add more footer links if needed (Privacy Policy, etc.) */}
                        </Container>
                    </Box>

                </Box> {/* End Flex container */}
            </Router>
        </ThemeProvider>
    );
}

export default App;