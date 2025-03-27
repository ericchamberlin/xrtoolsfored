// webxr-directory-frontend/src/pages/HomePage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Container,
    Grid, // Still used for the main card layout
    Typography,
    TextField,
    Select, // Still used for Sort By
    MenuItem,
    InputLabel,
    FormControl,
    Alert,
    Paper,
    FormGroup, // For grouping checkboxes
    FormControlLabel, // For label + checkbox
    Checkbox, // The checkbox component
    Box
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import debounce from 'lodash.debounce';

import ToolCard, { ToolCardSkeleton } from '../components/ToolCard';
import { getTools, Tool } from '../services/api';

// --- Define Filter/Sort Options ---

// Final list of 16 categories for checkboxes
const CHECKBOX_CATEGORIES = [
    // Row 1
    'Science', 'History', 'Geography', 'Arts',
    // Row 2
    '360 Video', 'Simulation', 'VR', 'Exploration',
    // Row 3
    'Space', 'Social Studies', 'Health / Medicine', 'Technology',
    // Row 4
    'Creativity / Design', 'Documentary', 'Interactive Story / Narrative', 'Productivity'
].sort(); // Keep them sorted alphabetically for display

// Sort options remain the same
const SORT_OPTIONS: { [key: string]: string } = {
    'title-asc': 'Name (A-Z)',
    'title-desc': 'Name (Z-A)',
    'rating-desc': 'Rating (High-Low)',
    'rating-asc': 'Rating (Low-High)',
};

const HomePage: React.FC = () => {
    // --- State ---
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Search State
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // **NEW**: Checkbox Filter State - use an object for easy lookup
    const [selectedCategories, setSelectedCategories] = useState<{ [key: string]: boolean }>({});

    // Sort State
    const [sortValue, setSortValue] = useState<string>('title-asc');

    // Derived state for sorting
    const [sortBy, sortOrder] = useMemo(() => {
        const [field, order] = sortValue.split('-');
        return [field || 'title', (order as 'asc' | 'desc') || 'asc'];
    }, [sortValue]);

    // --- Debounced Search ---
    const debouncedSetSearchTerm = useCallback(debounce((value: string) => setSearchTerm(value), 400), []);
    const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        debouncedSetSearchTerm(event.target.value);
    };

    // --- Checkbox Handler ---
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedCategories({
            ...selectedCategories,
            [event.target.name]: event.target.checked,
        });
    };

    // --- Data Fetching ---
    const fetchTools = useCallback(async () => {
        setError(null);

        // Get array of selected category names
        const activeCategories = Object.entries(selectedCategories)
            .filter(([, isSelected]) => isSelected)
            .map(([categoryName]) => categoryName);

        // Join categories with a character the backend can split (e.g., comma)
        // Or modify backend to accept array via query params if preferred
        const categoryParam = activeCategories.length > 0 ? activeCategories.join(',') : undefined;

        console.log("Fetching with state:", { searchTerm, categories: categoryParam, sortBy, sortOrder });

        try {
            const params = {
                search: searchTerm || undefined,
                category: categoryParam, // Pass comma-separated string or undefined
                sortBy: sortBy,
                sortOrder: sortOrder,
            };
            const fetchedTools = await getTools(params);
            setTools(fetchedTools);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tools.');
            setTools([]);
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedCategories, sortBy, sortOrder]); // Depend on selectedCategories object

    // Effect for fetching
    useEffect(() => {
        setLoading(true);
        fetchTools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchTools]);

    // --- Sort Handler ---
    const handleSortChange = (event: SelectChangeEvent<string>) => { setSortValue(event.target.value as string); };

    // --- Render Logic ---
    const renderGridContent = () => { /* Keep this helper function as it was in the compiling version */
        if (loading) {
            return Array.from(new Array(6)).map((_, index) => ( <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}> <ToolCardSkeleton /> </Grid> ));
        }
        if (!tools || tools.length === 0) {
            return ( <Grid item xs={12}> <Typography align="center" sx={{ mt: 5, fontStyle: 'italic' }}> No tools found. Try adjusting filters or search. </Typography> </Grid> );
        }
        return tools.map((tool) => ( <Grid item xs={12} sm={6} md={4} key={tool.id}> <ToolCard tool={tool} /> </Grid> ));
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 1 }}>
                Discover WebXR Educational Tools
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Use the filters below, or enter keywords in the search bar for more specific results.
            </Typography>

            {/* --- Filters Section --- */}
            <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
                {/* Search and Sort Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                     <TextField label="Search Tools..." variant="outlined" value={inputValue} onChange={handleSearchInputChange} sx={{ flexGrow: { xs: 1, md: 0.5 }, minWidth: '200px' }} size="small" />
                     <FormControl sx={{ minWidth: 180 }} size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select value={sortValue} label="Sort By" onChange={handleSortChange}>
                            {Object.entries(SORT_OPTIONS).map(([value, label]) => (<MenuItem key={value} value={value}>{label}</MenuItem>))}
                        </Select>
                    </FormControl>
                </Box>

                {/* Checkbox Filters */}
                <FormGroup sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', // Responsive columns
                    gap: 1 // Spacing between checkboxes
                }}>
                    {CHECKBOX_CATEGORIES.map((category) => (
                        <FormControlLabel
                            key={category}
                            control={
                                <Checkbox
                                    checked={selectedCategories[category] || false}
                                    onChange={handleCheckboxChange}
                                    name={category} // Name corresponds to the key in state
                                />
                            }
                            label={category}
                        />
                    ))}
                </FormGroup>
            </Paper>

            {/* Error Display */}
            {error && !loading && (<Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>)}

            {/* Main Content Grid - Using MUI Grid again, assuming previous fix holds */}
             <Grid container spacing={3}>
                {renderGridContent()}
            </Grid>
        </Container>
    );
};

export default HomePage;