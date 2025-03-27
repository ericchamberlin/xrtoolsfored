// webxr-directory-frontend/src/components/ToolCard.tsx

import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardActions,
    Button,
    Chip,
    Box,
    Rating,
    Skeleton // Import Skeleton for loading state
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import LaunchIcon from '@mui/icons-material/Launch'; // Icon for external link
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Icon for details button

// Import the Tool interface from our API service
import { Tool } from '../services/api';

// Define props expected by the ToolCard component
interface ToolCardProps {
    tool: Tool;
}

// Placeholder image URL - replace with a more relevant one if desired
// In ToolCard.tsx
const PLACEHOLDER_IMAGE = 'https://i.imgur.com/eaOsWHB.png';

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    // State to handle image loading errors and switch to placeholder
    const [imageUrl, setImageUrl] = useState(tool.imageUrl || PLACEHOLDER_IMAGE);

    // Function to set placeholder image if the primary image fails to load
    const handleImageError = () => {
        setImageUrl(PLACEHOLDER_IMAGE);
    };

    // Determine primary category/tag to display (display the first one if multiple)
    const displayCategory = tool.category && tool.category.length > 0 ? tool.category[0] : null;
    // You could also choose to display more tags/categories if desired

    return (
        // Card component with fixed height and flex column layout ensures consistency
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
                component="img"
                height="180" // Set a consistent height for the image area
                image={imageUrl}
                alt={tool.name || 'Tool image'}
                sx={{ objectFit: 'cover' }} // 'cover' tries to fill, 'contain' shows whole image
                onError={handleImageError}  // Call handler on image load error
            />
            {/* CardContent takes remaining space */}
            <CardContent sx={{ flexGrow: 1, pb: 1 /* Reduce bottom padding */ }}>
                {/* Tool Name */}
                <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    noWrap // Prevent long names from wrapping
                    title={tool.name} // Show full name on hover
                    sx={{ mb: 0.5 }}
                >
                    {tool.name || 'Unnamed Tool'}
                </Typography>

                {/* Short Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    title={tool.shortDescription} // Show full description on hover if truncated
                    sx={{
                        mb: 1.5,
                        height: '4.5em', // Approx 3 lines height (3 * 1.5em line-height)
                        lineHeight: '1.5em',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // Limit to 3 lines
                        WebkitBoxOrient: 'vertical',
                    }}
                >
                    {tool.shortDescription || 'No description available.'}
                </Typography>

                {/* Rating Display */}
                {/* Render Rating only if rating exists and is a number */}
                {typeof tool.rating === 'number' && !isNaN(tool.rating) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, height: '24px' /* Fixed height */ }}>
                        <Rating
                            name={`rating-${tool.id}`}
                            value={tool.rating}
                            precision={0.5}
                            readOnly
                            size="small"
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                            ({tool.rating.toFixed(1)}) {/* Show rating value */}
                        </Typography>
                    </Box>
                )}
                {/* Render placeholder Box if rating doesn't exist to maintain layout consistency */}
                {(typeof tool.rating !== 'number' || isNaN(tool.rating)) && (
                    <Box sx={{ height: '24px', mb: 1 }} />
                )}

                {/* Category/Tag Chip */}
                <Box sx={{ minHeight: '32px' /* Ensure space even if no chip */ }}>
                    {displayCategory && (
                        <Chip
                            label={displayCategory}
                            size="small"
                            variant="outlined"
                            title={`Category: ${displayCategory}`}
                        />
                        // Add more chips here if you want to display more categories from tool.category array
                    )}
                    {/* Add Pricing Chip here if you re-introduce the pricing field */}
                    {/* {tool.pricing && <Chip label={tool.pricing} size="small" color="primary" variant="outlined" sx={{ ml: 0.5 }} />} */}
                </Box>

            </CardContent>

            {/* Card Actions (Buttons) at the bottom */}
            <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                {/* Details Button */}
                <Button
                    size="small"
                    component={RouterLink} // Use React Router Link
                    to={`/tool/${tool.id}`} // Link to the detail page
                    startIcon={<InfoOutlinedIcon fontSize='small' />}
                >
                    Details
                </Button>

                {/* Visit Site Button (only if URL exists) */}
                {tool.url && (
                    <Button
                        size="small"
                        href={tool.url}
                        target="_blank" // Open in new tab
                        rel="noopener noreferrer" // Security measure for target="_blank"
                        endIcon={<LaunchIcon fontSize='small' />} // Icon indicates external link
                    >
                        Visit Tool
                    </Button>
                )}
            </CardActions>
        </Card>
    );
};

// --- Optional: Skeleton Loader Component ---
// Displayed while the tool data is loading on the HomePage
export const ToolCardSkeleton: React.FC = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={180} />
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
            <Skeleton variant="text" height={32} width="80%" sx={{ mb: 0.5 }} /> {/* Name */}
            <Skeleton variant="text" height={20} /> {/* Description Line 1 */}
            <Skeleton variant="text" height={20} /> {/* Description Line 2 */}
            <Skeleton variant="text" height={20} width="60%" sx={{ mb: 1.5 }}/> {/* Desc Line 3 */}
            <Box sx={{ height: '24px', mb: 1 }}> {/* Rating Placeholder */}
                <Skeleton variant="rectangular" width={100} height={20} />
            </Box>
            <Box sx={{ minHeight: '32px' }}> {/* Chip Placeholder */}
                 <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '16px' }}/>
            </Box>
        </CardContent>
        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
            <Skeleton variant="rectangular" width={80} height={30} sx={{ borderRadius: '8px' }} /> {/* Details Button */}
            <Skeleton variant="rectangular" width={90} height={30} sx={{ borderRadius: '8px' }} /> {/* Visit Button */}
        </CardActions>
    </Card>
);


export default ToolCard; // Export the main component