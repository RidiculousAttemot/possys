// controllers/items.js

const db = require('../database'); // Database connection

// GET all inventory items
exports.getInventory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

// POST a new item
exports.addItem = async (req, res) => {
    try {
        const { item_name, description, price, category, stock_quantity, image } = req.body;
        
        // Validate required fields
        if (!item_name || !price || !category) {
            return res.status(400).json({ error: 'Item name, price, and category are required' });
        }
        
        // Insert new item with correct column names
        const [result] = await db.query(
            'INSERT INTO items (item_name, description, price, category, stock_quantity, image) VALUES (?, ?, ?, ?, ?, ?)',
            [item_name, description || null, price, category, stock_quantity || 0, image || null]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Item added successfully' 
        });
    } catch (error) {
        console.error('Error adding item:', error);
        res.status(500).json({ error: 'Failed to add item' });
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
        
        // Complete the SQL query with correct primary key column
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
        
        // Use correct primary key column name
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
