// controllers/items.js

const db = require('../database'); // Database connection

// GET all inventory items
exports.getInventory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items ORDER BY item_id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

// GET a single item by ID
exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM items WHERE item_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
};

// Create new item - improved error handling
exports.addItem = async (req, res) => {
    try {
        console.log('Adding new item with data:', req.body);
        
        const { item_name, description, category, price, stock_quantity, image } = req.body;
        
        // Validate required fields
        if (!item_name) {
            return res.status(400).json({ error: 'Item name is required' });
        }
        
        // Use default values for missing fields
        const safeCategory = category || 'Uncategorized';
        const safePrice = isNaN(price) ? 0 : price;
        const safeStock = isNaN(stock_quantity) ? 0 : stock_quantity;
        const safeDescription = description || '';
        
        // Insert the item into the database
        const [result] = await db.query(
            'INSERT INTO items (item_name, description, category, price, stock_quantity, image) VALUES (?, ?, ?, ?, ?, ?)',
            [item_name, safeDescription, safeCategory, safePrice, safeStock, image]
        );
        
        // Log successful creation
        console.log(`Item created with ID: ${result.insertId}`);
        
        // Return success response
        res.status(201).json({
            message: 'Item created successfully',
            item_id: result.insertId,
            item: {
                item_id: result.insertId,
                item_name,
                description: safeDescription,
                category: safeCategory,
                price: safePrice,
                stock_quantity: safeStock,
                image
            }
        });
    } catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: 'Failed to create item: ' + error.message });
    }
};

// PUT (update) an existing item by ID
exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { item_name, description, price, category, stock_quantity, image } = req.body;
        
        // Start building the SQL query and parameters
        let sql = 'UPDATE items SET ';
        const params = [];
        const updates = [];
        
        // Add fields that are present in the request
        if (item_name) {
            updates.push('item_name = ?');
            params.push(item_name);
        }
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        if (category) {
            updates.push('category = ?');
            params.push(category);
        }
        if (price !== undefined) {
            updates.push('price = ?');
            params.push(price);
        }
        if (stock_quantity !== undefined) {
            updates.push('stock_quantity = ?');
            params.push(stock_quantity);
        }
        if (image !== undefined) {
            updates.push('image = ?');
            params.push(image);
        }
        
        // If no fields to update
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Complete the SQL query
        sql += updates.join(', ') + ' WHERE item_id = ?';
        params.push(id);
        
        // Execute the update
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json({ message: 'Item updated successfully' });
    } catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: 'Failed to update item' });
    }
};

// DELETE an item by ID
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM items WHERE item_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
};
