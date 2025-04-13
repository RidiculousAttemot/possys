// controllers/transactions.js

const db = require('../database'); // Database connection

// Get all transactions
exports.getAllTransactions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, u.full_name as cashier_name 
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

// Get transaction by ID with its items
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get transaction data
        const [transactions] = await db.query(`
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            WHERE t.transaction_id = ?
        `, [id]);
        
        if (!transactions || transactions.length === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        
        // Get transaction items
        const [items] = await db.query(`
            SELECT ti.*, i.item_name, i.category
            FROM transaction_items ti
            JOIN items i ON ti.item_id = i.item_id
            WHERE ti.transaction_id = ?
        `, [id]);
        
        // Return complete transaction data
        res.json({
            transaction: transactions[0],
            items: items
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ error: 'Failed to fetch transaction' });
    }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
    // Start a transaction to ensure data integrity
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        const { user_id, total_amount, payment_method, items } = req.body;
        
        // Validate required fields
        if (!user_id || !total_amount || !payment_method || !items || !items.length) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ error: 'Missing required fields' });
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
            
            // Update inventory quantity
            await connection.query(
                'UPDATE items SET stock_quantity = stock_quantity - ? WHERE item_id = ?',
                [item.quantity, item.item_id]
            );
        }
        
        // Commit the transaction
        await connection.commit();
        connection.release();
        
        res.status(201).json({ 
            id: transaction_id,
            message: 'Transaction created successfully' 
        });
    } catch (error) {
        // Rollback in case of error
        await connection.rollback();
        connection.release();
        console.error('Error creating transaction:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
    try {
        // Today's transactions
        const [todayStats] = await db.query(`
            SELECT COUNT(*) as count, SUM(total_amount) as total
            FROM transactions
            WHERE DATE(transaction_date) = CURDATE()
        `);
        
        // This week's transactions
        const [weekStats] = await db.query(`
            SELECT COUNT(*) as count, SUM(total_amount) as total
            FROM transactions
            WHERE YEARWEEK(transaction_date) = YEARWEEK(CURDATE())
        `);
        
        // This month's transactions
        const [monthStats] = await db.query(`
            SELECT COUNT(*) as count, SUM(total_amount) as total
            FROM transactions
            WHERE MONTH(transaction_date) = MONTH(CURDATE()) 
            AND YEAR(transaction_date) = YEAR(CURDATE())
        `);
        
        // Payment method breakdown
        const [paymentStats] = await db.query(`
            SELECT payment_method, COUNT(*) as count, SUM(total_amount) as total
            FROM transactions
            GROUP BY payment_method
        `);
        
        res.json({
            today: {
                count: todayStats[0].count || 0,
                total: todayStats[0].total || 0
            },
            thisWeek: {
                count: weekStats[0].count || 0,
                total: weekStats[0].total || 0
            },
            thisMonth: {
                count: monthStats[0].count || 0,
                total: monthStats[0].total || 0
            },
            paymentMethods: paymentStats
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({ error: 'Failed to fetch transaction statistics' });
    }
};
