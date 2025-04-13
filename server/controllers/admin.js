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

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        // Initialize default values
        let totalUsers = 0;
        let totalSales = 0;
        let itemCount = 0;
        let transactionCount = 0;
        let lowStockCount = 0;
        
        // Try to get user count - using correct table structure
        try {
            const [userRows] = await db.query('SELECT COUNT(*) as total FROM users');
            totalUsers = userRows[0].total || 0;
        } catch (err) {
            console.error('Error counting users:', err);
        }
        
        // Try to get total sales - using transactions table instead of orders
        try {
            const [salesRows] = await db.query('SELECT SUM(total_amount) as total FROM transactions');
            totalSales = salesRows[0].total || 0;
        } catch (err) {
            console.error('Error calculating sales:', err);
        }
        
        // Try to get inventory count - using items table instead of products
        try {
            const [productRows] = await db.query('SELECT COUNT(*) as total FROM items');
            itemCount = productRows[0].total || 0;
        } catch (err) {
            console.error('Error counting products:', err);
        }
        
        // Try to get transaction count - using transactions table
        try {
            const [transactionRows] = await db.query('SELECT COUNT(*) as total FROM transactions');
            transactionCount = transactionRows[0].total || 0;
        } catch (err) {
            console.error('Error counting transactions:', err);
        }
        
        // Try to get low stock items count - using items table and stock_quantity
        try {
            const [lowStockRows] = await db.query('SELECT COUNT(*) as total FROM items WHERE stock_quantity <= 5');
            lowStockCount = lowStockRows[0].total || 0;
        } catch (err) {
            console.error('Error counting low stock items:', err);
        }
        
        // Return dashboard statistics
        res.json({
            totalUsers,
            totalSales,
            itemCount,
            transactionCount,
            lowStockCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.json({
            totalUsers: 0,
            totalSales: 0,
            itemCount: 0,
            transactionCount: 0,
            lowStockCount: 0
        });
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
