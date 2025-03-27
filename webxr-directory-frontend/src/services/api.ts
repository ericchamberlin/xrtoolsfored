// webxr-directory-frontend/src/services/api.ts

import axios, { AxiosError } from 'axios';

// --- Interfaces ---

// Define an interface for the Tool object
// This should match the structure of the objects FORMATTED and RETURNED by your backend API
export interface Tool {
    id: string;
    name: string;            // From 'title'
    description?: string;    // From 'description'
    shortDescription?: string;// From 'description'
    url?: string | null;     // From 'link'
    category?: string[];     // From 'tags'
    pricing?: string | null; // From 'Pricing'
    rating?: number | null;  // From 'rating'
    imageUrl?: string | null;// From 'thumbnail'
    author?: string | null;  // From 'author'
}

// Define the shape of the data expected by the backend for submission
// Keys MUST match what the backend's POST /api/tools/submit expects in req.body
// This is based on the `requiredFrontendFields` and `newToolData` mapping in routes/tools.js
export type ToolSubmissionData = {
    'Tool Name': string;
    'URL': string;
    'Description': string;      // Changed from Short Description
    'Category': string | string[]; // Maps to 'tags' on backend
    'Pricing': string;
    'Image URL'?: string;        // Optional, maps to 'thumbnail'
    // No submitter/email yet
};


// --- Axios Client Setup ---

// Create an Axios instance configured to talk to your backend API
const apiClient = axios.create({
    // Use the API URL from the .env file, or fallback to a relative path (useful if served together)
    baseURL: process.env.REACT_APP_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json', // We'll be sending JSON data
    },
});


// --- API Functions ---

// Type for query parameters for the getTools function
interface GetToolsParams {
    search?: string;
    category?: string; // Single category string for filtering
    // pricing?: string; // Omitted as per decision
    sortBy?: string;   // Field name like 'title' or 'rating'
    sortOrder?: 'asc' | 'desc';
}

/**
 * Fetches a list of tools from the backend API, optionally filtering and sorting.
 * @param params - Optional object containing search, category, sortBy, sortOrder parameters.
 * @returns Promise resolving to an array of Tool objects.
 */
export const getTools = async (params?: GetToolsParams): Promise<Tool[]> => {
    console.log("Frontend fetching tools with params:", params); // Debug log
    try {
        // Filter out undefined/empty string params before sending? (Optional, backend handles undefined)
        const filteredParams: Record<string, string> = {};
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    filteredParams[key] = value;
                }
            });
        }

        // Make GET request to /api/tools with parameters
        const response = await apiClient.get<Tool[]>('/tools', { params: filteredParams });
        return response.data; // Return the array of tools from the response body
    } catch (error) {
        console.error("Error fetching tools:", error);
        // Re-throw the error so calling components can handle it (e.g., show error message)
        throw error;
    }
};

/**
 * Fetches a single tool by its ID from the backend API.
 * @param id - The Airtable Record ID of the tool.
 * @returns Promise resolving to a single Tool object.
 */
export const getToolById = async (id: string): Promise<Tool> => {
    console.log("Frontend fetching tool by ID:", id); // Debug log
    if (!id) throw new Error("Tool ID is required"); // Basic validation

    try {
        // Make GET request to /api/tools/:id
        const response = await apiClient.get<Tool>(`/tools/${id}`);
        return response.data; // Return the single tool object
    } catch (error) {
        console.error(`Error fetching tool ${id}:`, error);
        // Check if it's an Axios error with a response (e.g., 404 Not Found)
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || `Failed to fetch tool ${id}. Status: ${error.response.status}`);
        }
        // Otherwise, re-throw the original error
        throw error;
    }
};

/**
 * Submits new tool data to the backend API.
 * @param toolData - Object containing the data for the new tool, matching ToolSubmissionData type.
 * @returns Promise resolving to the newly created Tool object (as returned by the backend).
 */
export const submitTool = async (toolData: ToolSubmissionData): Promise<Tool> => {
    console.log("Frontend submitting tool:", toolData); // Debug log
    try {
        // Make POST request to /api/tools/submit with the tool data in the request body
        const response = await apiClient.post<Tool>('/tools/submit', toolData);
        return response.data; // Return the created tool object from the response body
    } catch (error) {
        console.error("Error submitting tool:", error);
        // Improve error handling: Check if it's an Axios error to get backend validation messages
        if (axios.isAxiosError(error) && error.response) {
            // Pass backend validation errors or specific messages if available
            const errorData = error.response.data;
            let message = errorData?.message || 'Submission failed. Please check your input.';
            // If backend sends specific field errors in error.details
            if (errorData?.details && typeof errorData.details === 'object') {
                 const fieldErrors = Object.entries(errorData.details)
                                       .map(([key, value]) => `${key}: ${value}`)
                                       .join(', ');
                 message += ` Details: ${fieldErrors}`;
            }
             throw new Error(message);
        } else {
            // Generic error
            throw new Error('An unexpected error occurred during submission.');
        }
    }
};

// Export the apiClient if needed elsewhere, though usually just functions are exported
// export default apiClient;