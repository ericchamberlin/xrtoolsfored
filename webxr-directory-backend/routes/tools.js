// webxr-directory-backend/routes/tools.js

const express = require('express');
const Airtable = require('airtable');
const router = express.Router();

// --- Configure Airtable ---
if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_TABLE_NAME) {
    console.error("FATAL ERROR: Airtable configuration missing in environment variables.");
    // Consider exiting process: process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

// --- Helper Function to Format Airtable Records ---
const formatRecord = (record) => {
    const fields = record.fields;
    return {
        id: record.id,
        name: fields['title'] || 'Untitled Tool',
        description: fields['description'] || '',
        shortDescription: fields['description'] || '',
        url: fields['link'] || null,
        category: fields['tags'] || null, // Keep sending tags string
        rating: fields['rating'] || null,
        imageUrl: fields['thumbnail'] || null,
        author: fields['author'] || null
    };
};

// --- API Endpoints ---

// GET /api/tools - Fetch all tools with filtering and sorting
router.get('/', async (req, res, next) => {
    const { search, category, sortBy = 'title', sortOrder = 'asc' } = req.query;

    let formulaParts = [];
    let filterByFormula = '';

    if (!tableName) { return next(new Error("Airtable table name not configured.")); }

    // 1. Build Filter Formula for Search
    if (search) {
        const searchTerm = search.toLowerCase().replace(/'/g, "\\'");
        // Rely on SEARCH being case-insensitive, remove LOWER() from field names
        formulaParts.push(
            `OR(
                SEARCH('${searchTerm}', {title}),
                SEARCH('${searchTerm}', {description}),
                SEARCH('${searchTerm}', {tags})
            )` // CORRECTED: Removed LOWER() around field names
        );
    }

    // 2. Build Filter Formula for Multiple Categories ('tags' field)
    if (category) {
        const categoryList = category.split(',')
                                 .map(cat => cat.trim().replace(/'/g, "\\'"))
                                 .filter(cat => cat.length > 0);

        if (categoryList.length > 0) {
            // Rely on SEARCH being case-insensitive, remove LOWER() from field name
            const searchFormulas = categoryList.map(catTerm =>
                `SEARCH('${catTerm}', {tags})` // CORRECTED: Removed LOWER() around {tags}
            );
            formulaParts.push(`OR(${searchFormulas.join(', ')})`);
        }
    }

    // 3. Combine formula parts
    if (formulaParts.length > 0) { filterByFormula = `AND(${formulaParts.join(', ')})`; }

    // 4. Build Sort Object
    const validSortFields = ['title', 'rating'];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : 'title';
    const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
    const sort = [{ field: safeSortBy, direction: safeSortOrder }];

    // 5. Select fields to retrieve
    const fieldsToSelect = ['title', 'description', 'link', 'tags', 'rating', 'thumbnail', 'author'];

    // 6. Fetch data from Airtable
    try {
        console.log(`Fetching from Airtable: Table='${tableName}', Formula='${filterByFormula}', SortBy='${safeSortBy}', SortOrder='${safeSortOrder}'`);
        const records = await base(tableName)
            .select({ pageSize: 100, filterByFormula, sort, fields: fieldsToSelect })
            .all();
        const formattedRecords = records.map(formatRecord);
        res.json(formattedRecords);
    } catch (err) {
        console.error('Error fetching tools from Airtable:', err);
        next(err);
    }
});

// GET /api/tools/:id - (Keep as before)
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;
    if (!tableName) { return next(new Error("Airtable table name not configured.")); }
    try {
        const record = await base(tableName).find(id);
        res.json(formatRecord(record));
    } catch (err) {
        if (err.statusCode === 404 || err.error === 'NOT_FOUND') {
            const error = new Error(`Tool with ID '${id}' not found`); error.status = 404; next(error);
        } else { next(err); }
    }
});

// POST /api/tools/submit - (Keep as before)
router.post('/submit', async (req, res, next) => {
    if (!tableName) { return next(new Error("Airtable table name is not configured.")); }
    const errors = {}; const receivedData = req.body;
    if (!receivedData['Tool Name']?.trim()) errors['Tool Name'] = 'Tool Name is required';
    if (!receivedData['URL']?.trim()) { errors['URL'] = 'Tool URL is required'; }
    else { try { new URL(receivedData['URL']); } catch (_) { errors['URL'] = 'Invalid URL format'; } }
    if (!receivedData['Description']?.trim()) errors['Description'] = 'Description is required';
    if (!receivedData['Category']?.trim()) errors['Category'] = 'Category is required';
   

    if (Object.keys(errors).length > 0) {
        const error = new Error('Validation failed'); error.status = 400; error.details = errors;
        return next(error);
    }
    const newToolData = {
        'title': receivedData['Tool Name'], 'link': receivedData['URL'],
        'description': receivedData['Description'], 'tags': receivedData['Category'],
    };
    
    if (receivedData['Image URL']) { newToolData['thumbnail'] = receivedData['Image URL']; }
    try {
        const createdRecords = await base(tableName).create([{ fields: newToolData }]);
        res.status(201).json(formatRecord(createdRecords[0]));
    } catch (err) { next(err); }
});

module.exports = router;