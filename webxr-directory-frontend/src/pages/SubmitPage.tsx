// webxr-directory-frontend/src/pages/SubmitPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, TextField, Button, Box, CircularProgress, Alert, Select,
    MenuItem, InputLabel, FormControl, FormHelperText, Paper
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Import API functions and Submission type
import { submitTool, ToolSubmissionData, Tool } from '../services/api';

// Reuse options from HomePage or define here
// TODO: Ensure these CATEGORY_OPTIONS match the ones used in HomePage.tsx
const CATEGORY_OPTIONS = [
    '360 Video', 'Womens History Month', 'VR', 'Education', 'Simulation',
    'Art', 'Science', 'History', 'Collaboration', 'Virtual Tour'
].sort();

// Define Pricing options
const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid', 'Contact Us', 'Unknown']; // Added Unknown

// Define the type for the form data state
// Keys should match the ToolSubmissionData type for easier mapping
type FormData = {
    'Tool Name': string;
    'URL': string;
    'Description': string;
    'Category': string; // Use string for single select dropdown state
    'Pricing': string;
    'Image URL': string; // Optional field
};

// Define the type for form errors state
type FormErrors = { [key in keyof FormData]?: string };

const SubmitPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        'Tool Name': '',
        'URL': '',
        'Description': '',
        'Category': '',
        'Pricing': '',
        'Image URL': ''
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null); // General submission error
    const [success, setSuccess] = useState<string | null>(null);

    // --- Input Validation ---
    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        let isValid = true;

        if (!formData['Tool Name'].trim()) errors['Tool Name'] = 'Tool Name is required';
        if (!formData['URL'].trim()) {
            errors['URL'] = 'Tool URL is required';
        } else {
            try { new URL(formData['URL']); } // Basic URL format check
            catch (_) { errors['URL'] = 'Invalid URL format (e.g., https://...)'; }
        }
        if (!formData['Description'].trim()) errors['Description'] = 'Description is required';
        if (!formData['Category']) errors['Category'] = 'Category is required';
        if (!formData['Pricing']) errors['Pricing'] = 'Pricing model is required';
        // Image URL is optional, no validation unless you want format check
        // if (formData['Image URL'] && !isValidUrl(formData['Image URL'])) errors['Image URL'] = 'Invalid Image URL format';

        setFormErrors(errors);
        isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            setError("Please correct the errors highlighted below.");
        } else {
            setError(null); // Clear general error if validation passes now
        }
        return isValid;
    };

    // --- Handle Input Changes ---
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific field error on change if it existed
        if (formErrors[name as keyof FormData]) {
            setFormErrors(prev => {
                const updatedErrors = { ...prev };
                delete updatedErrors[name as keyof FormData];
                // If clearing the last field error, also clear the general error message
                if (Object.keys(updatedErrors).length === 0) {
                    setError(null);
                }
                return updatedErrors;
            });
        }
    };

    // --- Handle Form Submission ---
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return; // Stop submission if validation fails
        }

        setLoading(true);

        // Prepare payload matching ToolSubmissionData
        const apiPayload: ToolSubmissionData = {
            'Tool Name': formData['Tool Name'],
            'URL': formData['URL'],
            'Description': formData['Description'],
            'Category': formData['Category'], // Backend expects array/string, will handle array conversion
            'Pricing': formData['Pricing'],
            'Image URL': formData['Image URL'] || undefined, // Send undefined if empty
            // submitter/email not included
        };

        try {
            const newTool: Tool = await submitTool(apiPayload);
            setSuccess(`Thank you! Tool "${newTool.name}" submitted successfully.`);
            // Reset form
            setFormData({ 'Tool Name': '', 'URL': '', 'Description': '', 'Category': '', 'Pricing': '', 'Image URL': '' });
            setFormErrors({});
            // Optional: Redirect after a delay
            // setTimeout(() => navigate(`/tool/${newTool.id}`), 3000);
        } catch (err) {
            console.error("Submission error:", err);
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Logic ---
    return (
        <Container maxWidth="sm"> {/* Use smaller max width for forms */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 3, borderRadius: '12px' }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
                    Submit a New WebXR Tool
                </Typography>

                {/* Display Success Message */}
                {success && (
                    <Alert severity="success" icon={<CheckCircleOutlineIcon fontSize="inherit" />} sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                {/* Hide form after success, or just keep it visible */}
                {/* {!success && ( */}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    {/* General Error Message */}
                    {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {/* Form Fields */}
                    <TextField
                        margin="normal" required fullWidth autoFocus
                        id="tool-name" label="Tool Name" name="Tool Name"
                        value={formData['Tool Name']} onChange={handleChange}
                        error={!!formErrors['Tool Name']} helperText={formErrors['Tool Name']}
                        disabled={loading}
                    />
                    <TextField
                        margin="normal" required fullWidth
                        id="tool-url" label="Tool URL" name="URL" type="url"
                        value={formData['URL']} onChange={handleChange}
                        error={!!formErrors['URL']} helperText={formErrors['URL']}
                        disabled={loading}
                    />
                     <TextField
                        margin="normal" required fullWidth multiline rows={4}
                        id="tool-description" label="Description" name="Description"
                        value={formData['Description']} onChange={handleChange}
                        error={!!formErrors['Description']} helperText={formErrors['Description']}
                        disabled={loading}
                    />
                    <FormControl margin="normal" fullWidth required error={!!formErrors['Category']} disabled={loading}>
                        <InputLabel id="category-label">Category</InputLabel>
                        <Select
                            labelId="category-label" id="category" name="Category"
                            value={formData['Category']} label="Category" onChange={handleChange}
                        >
                            <MenuItem value="" disabled><em>Select a Category</em></MenuItem>
                            {CATEGORY_OPTIONS.map(option => ( <MenuItem key={option} value={option}>{option}</MenuItem> ))}
                        </Select>
                        {formErrors['Category'] && <FormHelperText>{formErrors['Category']}</FormHelperText>}
                    </FormControl>
                     <FormControl margin="normal" fullWidth required error={!!formErrors['Pricing']} disabled={loading}>
                        <InputLabel id="pricing-label">Pricing Model</InputLabel>
                        <Select
                            labelId="pricing-label" id="pricing" name="Pricing"
                            value={formData['Pricing']} label="Pricing Model" onChange={handleChange}
                        >
                            <MenuItem value="" disabled><em>Select Pricing</em></MenuItem>
                            {PRICING_OPTIONS.map(option => ( <MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                        {formErrors['Pricing'] && <FormHelperText>{formErrors['Pricing']}</FormHelperText>}
                    </FormControl>
                    <TextField
                        margin="normal" fullWidth
                        id="image-url" label="Image URL (Optional)" name="Image URL" type="url"
                        value={formData['Image URL']} onChange={handleChange}
                        error={!!formErrors['Image URL']} helperText={formErrors['Image URL']}
                        disabled={loading}
                    />

                    {/* Submit Button with Loading Indicator */}
                    <Button
                        type="submit" fullWidth variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Tool'}
                    </Button>
                </Box>
                {/* )} */}
            </Paper>
        </Container>
    );
};

export default SubmitPage;