// controllers/products.js

const db = require('../database'); // Database connection

// GET all products/inventory items
exports.getInventory = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
};

// POST a new product/item
exports.addProduct = async (req, res) => {
    try {
        const { name, description, category, price, quantity, reorder_level, supplier } = req.body;
        
        // Validate required fields
        if (!name || !price || !quantity) {
            return res.status(400).json({ error: 'Name, price, and quantity are required' });
        }
        
        // Insert new product
        const [result] = await db.query(
            'INSERT INTO products (name, description, category, price, quantity, reorder_level, supplier) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description || null, category || null, price, quantity, reorder_level || 5, supplier || null]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'Product added successfully' 
        });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
};

// PUT (update) an existing product by ID
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, price, quantity, reorder_level, supplier } = req.body;
        
        // Start building the SQL query and parameters
        let sql = 'UPDATE products SET ';
        const params = [];
        const updates = [];
        
        // Add fields that are present in the request
        if (name) {
            updates.push('name = ?');
            params.push(name);
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
        if (quantity !== undefined) {
            updates.push('quantity = ?');
            params.push(quantity);
        }
        if (reorder_level !== undefined) {
            updates.push('reorder_level = ?');
            params.push(reorder_level);
        }
        if (supplier !== undefined) {
            updates.push('supplier = ?');
            params.push(supplier);
        }
        
        // If no fields to update
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Complete the SQL query
        sql += updates.join(', ') + ' WHERE id = ?';
        params.push(id);
        
        // Execute the update
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};

// DELETE a product by ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
