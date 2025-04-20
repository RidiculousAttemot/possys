// controllers/admin.js

const db = require('../database'); // Database connection

// Get admin information
exports.getAdminInfo = async (req, res) => {
    try {
        // Use correct column names based on your database schema
        const [rows] = await db.query('SELECT user_id, username, full_name, email, role, created_at FROM users WHERE role = "admin" LIMIT 1');
        
        if (!rows || rows.length === 0) {
            return res.json({
                name: 'Admin User',
                role: 'admin',
                lastLogin: new Date().toISOString()
            });
        }
        
        res.json({
            id: rows[0].user_id,
            name: rows[0].full_name || 'Admin User',
            username: rows[0].username,
            email: rows[0].email,
            role: rows[0].role,
            lastLogin: rows[0].created_at || new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching admin info:', error);
        res.json({
            name: 'Admin User',
            role: 'admin',
            lastLogin: new Date().toISOString()
        });
    }
};

// Get dashboard statistics from database
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Fetching dashboard statistics from database');
        
        // Initialize stats object
        const stats = {
            totalUsers: 0,
            totalSales: 0,
            itemCount: 0,
            transactionCount: 0,
            recentTransactions: []
        };
        
        // Get total users count
        try {
            const [userRows] = await db.query('SELECT COUNT(*) as total FROM users');
            stats.totalUsers = userRows[0].total || 0;
            console.log('Total users:', stats.totalUsers);
        } catch (err) {
            console.error('Error counting users:', err);
        }
        
        // Get total sales
        try {
            const [salesRows] = await db.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM transactions');
            stats.totalSales = salesRows[0].total || 0;
            console.log('Total sales:', stats.totalSales);
        } catch (err) {
            console.error('Error calculating total sales:', err);
        }
        
        // Get item count
        try {
            const [itemRows] = await db.query('SELECT COUNT(*) as total FROM items');
            stats.itemCount = itemRows[0].total || 0;
            console.log('Item count:', stats.itemCount);
        } catch (err) {
            console.error('Error counting items:', err);
        }
        
        // Get transaction count
        try {
            const [transactionRows] = await db.query('SELECT COUNT(*) as total FROM transactions');
            stats.transactionCount = transactionRows[0].total || 0;
            console.log('Transaction count:', stats.transactionCount);
        } catch (err) {
            console.error('Error counting transactions:', err);
        }
        
        // Get recent transactions
        try {
            const [recentRows] = await db.query(`
                SELECT t.*, u.full_name as cashier_name 
                FROM transactions t
                LEFT JOIN users u ON t.user_id = u.user_id
                ORDER BY t.transaction_date DESC
                LIMIT 5
            `);
            stats.recentTransactions = recentRows;
            console.log('Recent transactions:', stats.recentTransactions.length);
        } catch (err) {
            console.error('Error fetching recent transactions:', err);
        }
        
        // Return all stats
        res.json(stats);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
};

// Get all transactions
exports.getTransactions = async (req, res) => {
    try {
        // Use your transactions table structure with correct join to users
        const query = `
            SELECT t.*, u.full_name as cashier_name 
            FROM transactions t
            LEFT JOIN users u ON t.user_id = u.user_id
            ORDER BY t.transaction_date DESC
        `;
        
        const [rows] = await db.query(query).catch(err => {
            console.error('Error with transaction join query:', err);
            // Simplified query as fallback
            return db.query('SELECT * FROM transactions ORDER BY transaction_date DESC');
        });
        
        res.json(rows);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.json([]);  // Return empty array instead of error
    }
};

// Generate daily/weekly/monthly reports
exports.generateReport = async (req, res) => {
    try {
        const { type } = req.params; // day, week, month
        
        let timeFilter;
        if (type === 'day') {
            timeFilter = 'DATE(transaction_date) = CURDATE()';
        } else if (type === 'week') {
            timeFilter = 'YEARWEEK(transaction_date) = YEARWEEK(CURDATE())';
        } else if (type === 'month') {
            timeFilter = 'MONTH(transaction_date) = MONTH(CURDATE()) AND YEAR(transaction_date) = YEAR(CURDATE())';
        } else {
            return res.status(400).json({ error: 'Invalid report type. Use day, week, or month.' });
        }
        
        // Get sales data for the period - using transactions table
        const [rows] = await db.query(`
            SELECT DATE(transaction_date) as date, SUM(total_amount) as total
            FROM transactions
            WHERE ${timeFilter}
            GROUP BY DATE(transaction_date)
            ORDER BY date
        `).catch(() => {
            return [[]]; // Return empty result if query fails
        });
        
        res.json(rows);
    } catch (error) {
        console.error('Error generating report:', error);
        res.json([]); // Return empty array instead of error
    }
};
