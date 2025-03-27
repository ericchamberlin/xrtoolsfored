// webxr-directory-frontend/src/pages/ToolDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
    Container, Typography, CircularProgress, Box, Paper, Button, Chip, Rating,
    CardMedia, Link as MuiLink, Alert, Breadcrumbs
    // No Grid import needed
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LinkIcon from '@mui/icons-material/Link';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { getToolById, Tool } from '../services/api';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/600x400.png?text=XR+Edu+Tool+Details';

const ToolDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState(PLACEHOLDER_IMAGE);

    useEffect(() => {
        const fetchTool = async () => {
            setLoading(true); setError(null); setTool(null); setImageUrl(PLACEHOLDER_IMAGE);
            if (!id) { setError("Invalid Tool ID."); setLoading(false); return; }
            try {
                const fetchedTool = await getToolById(id);
                console.log("Fetched Tool Data:", fetchedTool); // <-- DEBUG: Check fetched data
                setTool(fetchedTool);
                setImageUrl(fetchedTool.imageUrl || PLACEHOLDER_IMAGE);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load tool details.');
            } finally { setLoading(false); }
        };
        fetchTool();
    }, [id]);

    const handleImageError = () => {
        console.log("Image failed to load, setting placeholder."); // <-- DEBUG: Check if this runs
        setImageUrl(PLACEHOLDER_IMAGE);
    };

    // --- Render States ---
    if (loading) return ( <Container maxWidth="md" sx={{ textAlign: 'center', mt: 5 }}> <CircularProgress /> <Typography sx={{ mt: 2 }}>Loading...</Typography> </Container> );
    if (error) return ( <Container maxWidth="md" sx={{ mt: 3 }}> <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/" sx={{ mb: 2 }}>Back</Button> <Alert severity="error">{error}</Alert> </Container> );
    if (!tool) return ( <Container maxWidth="md" sx={{ mt: 3 }}> <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/" sx={{ mb: 2 }}>Back</Button> <Typography align="center" sx={{ mt: 5 }}>Tool not found.</Typography> </Container> );

    // --- Success State using CSS Grid via <Box> and sx prop ---
    const displayCategories = Array.isArray(tool.category) ? tool.category : (tool.category ? [tool.category] : []);
    console.log("Image URL State for render:", imageUrl); // <-- DEBUG: Check state before render

    return (
        <Container maxWidth="md">
            {/* Breadcrumbs */}
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ mb: 3 }}>
                <MuiLink component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }} color="inherit" underline="hover"> <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Discover </MuiLink>
                <Typography color="text.primary">{tool.name}</Typography>
            </Breadcrumbs>

            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: '12px' }}>
                {/* CSS Grid Container - Use Box */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, 1fr)', // 12 columns
                    gap: { xs: 2, sm: 3, md: 4 } // Responsive gap using theme spacing (2*8px, 3*8px, 4*8px)
                }}>

                    {/* Image Section - Use Box with sx for responsive gridColumn */}
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 5' } }}>
                        <CardMedia
                            component="img"
                            image={imageUrl}
                            alt={`Image for ${tool.name}`}
                            sx={{ width: '100%', borderRadius: '8px', maxHeight: { xs: 300, md: 400 }, objectFit: 'contain', border: '1px solid', borderColor: 'divider' }}
                            onError={handleImageError}
                        />
                    </Box>

                    {/* Details Section - Use Box with sx for responsive gridColumn */}
                    <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 7' } }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}> {tool.name} </Typography>
                        {typeof tool.rating === 'number' && !isNaN(tool.rating) && ( <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}> <Rating name="read-only-detail" value={tool.rating} precision={0.5} readOnly /> <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}> ({tool.rating.toFixed(1)}) </Typography> </Box> )}
                        <Typography variant="body1" paragraph sx={{ mb: 3, whiteSpace: 'pre-wrap' }}> {tool.description || 'No detailed description provided.'} </Typography>
                        {displayCategories.length > 0 && ( <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}> {displayCategories.map((cat) => (<Chip label={cat} key={cat} variant="outlined" size="small" />))} </Box> )}
                        {tool.url && ( <Button variant="contained" color="primary" href={tool.url} target="_blank" rel="noopener noreferrer" startIcon={<LinkIcon />} sx={{ mb: 3 }}> Visit Tool Website </Button> )}
                    </Box>

                </Box> {/* End CSS Grid Container */}
            </Paper>
        </Container>
    );
};

export default ToolDetailPage;