// controllers/transactions.js
const db = require('../database');

// GET all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.full_name AS cashier_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            ORDER BY t.transaction_date DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// GET transactions by user ID
exports.getTransactionsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const [rows] = await db.query(`
            SELECT t.*, u.full_name AS cashier_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.user_id = ?
            ORDER BY t.transaction_date DESC
        `, [userId]);
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// GET a single transaction by ID with items
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get transaction details
        const [transactions] = await db.query(`
            SELECT t.*, u.full_name AS cashier_name
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.transaction_id = ?
        `, [id]);
        
        if (transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        const transaction = transactions[0];
        
        // Get transaction items
        const [items] = await db.query(`
            SELECT ti.*, i.item_name
            FROM transaction_items ti
            LEFT JOIN items i ON ti.item_id = i.item_id
            WHERE ti.transaction_id = ?
        `, [id]);
        
        transaction.items = items;
        
        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};

// Create a new transaction - Updated to handle items and update inventory
exports.createTransaction = async (req, res) => {
    // Get a connection from the pool to use for transaction
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { user_id, total_amount, payment_method, items } = req.body;
        
        // Validate request
        if (!user_id || !total_amount || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid transaction data' });
        }
        
        // Insert transaction
        const [transactionResult] = await connection.query(
            'INSERT INTO transactions (user_id, total_amount, payment_method) VALUES (?, ?, ?)',
            [user_id, total_amount, payment_method]
        );
        
        const transaction_id = transactionResult.insertId;
        
        // Insert transaction items and update inventory
        for (const item of items) {
            // Insert transaction item
            await connection.query(
                'INSERT INTO transaction_items (transaction_id, item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [transaction_id, item.item_id, item.quantity, item.price]
            );
            
            // Update inventory (reduce stock)
            await connection.query(
                'UPDATE items SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
                [item.quantity, item.item_id]
            );
        }
        
        // Commit the transaction
        await connection.commit();
        
        res.status(201).json({
            transaction_id,
            message: 'Transaction created successfully'
        });
    } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    } finally {
        // Release connection back to the pool
        connection.release();
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        // Get total sales
        const [totalSales] = await db.query(`
            SELECT COALESCE(SUM(total_amount), 0) as total
            FROM transactions
        `);
        
        // Get transaction count
        const [totalCount] = await db.query(`
            SELECT COUNT(*) as count
            FROM transactions
        `);
        
        // Get daily sales for the last 7 days
        const [dailySales] = await db.query(`
            SELECT DATE(transaction_date) as date, SUM(total_amount) as total
            FROM transactions
            WHERE transaction_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(transaction_date)
            ORDER BY date DESC
        `);
        
        // Get recent transactions
        const [recentTransactions] = await db.query(`
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            ORDER BY t.transaction_date DESC
            LIMIT 5
        `);
        
        res.json({
            totalSales: totalSales[0].total || 0,
            transactionCount: totalCount[0].count,
            dailySales,
            recentTransactions
        });
    } catch (error) {
        console.error('Error fetching transaction statistics:', error);
        res.status(500).json({ error: 'Failed to fetch transaction statistics' });
    }
};
