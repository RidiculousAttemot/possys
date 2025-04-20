// controllers/transactions.js

const db = require('../database'); // Database connection

// GET all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            ORDER BY t.transaction_date DESC
        `);
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
};

// GET a single transaction by ID with its items
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get transaction details
        const [transaction] = await db.query(`
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            WHERE t.transaction_id = ?
        `, [id]);
        
        if (transaction.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Get transaction items
        const [items] = await db.query(`
            SELECT ti.*, i.item_name, i.category, i.image
            FROM transaction_items ti
            JOIN items i ON ti.item_id = i.item_id
            WHERE ti.transaction_id = ?
        `, [id]);
        
        // Combine transaction with its items
        const result = {
            ...transaction[0],
            items
        };
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};

// POST a new transaction
exports.createTransaction = async (req, res) => {
    // Start a transaction to ensure all database operations succeed or fail together
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
        const { user_id, total_amount, payment_method, items } = req.body;
        
        // Validate required fields
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
            id: transaction_id,
            message: 'Transaction completed successfully' 
        });
    } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    } finally {
        connection.release();
    }
};

// GET transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        // Get total sales
        const [totalSales] = await db.query('SELECT SUM(total_amount) as total FROM transactions');
        
        // Get total transactions count
        const [totalCount] = await db.query('SELECT COUNT(*) as count FROM transactions');
        
        // Get daily sales for the last 7 days
        const [dailySales] = await db.query(`
            SELECT 
                DATE(transaction_date) as date,
                SUM(total_amount) as total
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
