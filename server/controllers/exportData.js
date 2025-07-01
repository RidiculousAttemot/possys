const db = require('../database');

// Export sales data by date range
exports.getSalesData = async (req, res) => {
    try {
        console.log('Exporting sales data with params:', req.query);
        const { startDate, endDate, specificDate } = req.query;
        
        let dateCondition;
        let dateParams;
        
        if (specificDate) {
            // For specific date
            const date = new Date(specificDate);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date < ?';
            dateParams = [date, nextDay];
        } else {
            // For date range
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date <= ?';
            dateParams = [new Date(startDate), new Date(endDate)];
        }
        
        // Query to get sales by category and date
        const query = `
            SELECT 
                DATE(t.transaction_date) AS date,
                i.category,
                SUM(ti.quantity) AS items_sold,
                SUM(ti.quantity * ti.price) AS revenue
            FROM transactions t
            JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
            JOIN items i ON ti.item_id = i.item_id
            ${dateCondition}
            GROUP BY DATE(t.transaction_date), i.category
            ORDER BY date DESC, i.category
        `;
        
        db.query(query, dateParams, (err, results) => {
            if (err) {
                console.error('Database error when exporting sales data:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            // Format dates for the response
            const formattedResults = results.map(item => ({
                date: new Date(item.date),
                category: item.category,
                items_sold: parseInt(item.items_sold),
                revenue: parseFloat(item.revenue)
            }));
            
            res.json(formattedResults);
        });
    } catch (error) {
        console.error('Error exporting sales data:', error);
        res.status(500).json({ 
            message: 'Failed to export sales data', 
            error: error.message 
        });
    }
};

// Export inventory data
exports.getInventoryData = async (req, res) => {
    try {
        console.log('Exporting inventory data');
        
        // Query to get all inventory items with their details
        const query = `
            SELECT 
                item_id AS id,
                item_name AS name,
                category,
                stock_quantity AS stock,
                price
            FROM items
            ORDER BY category, item_name
        `;
        
        db.query(query, (err, results) => {
            if (err) {
                console.error('Database error when exporting inventory data:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            // Format the response
            const formattedResults = results.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                stock: parseInt(item.stock),
                price: parseFloat(item.price)
            }));
            
            res.json(formattedResults);
        });
    } catch (error) {
        console.error('Error exporting inventory data:', error);
        res.status(500).json({ 
            message: 'Failed to export inventory data', 
            error: error.message 
        });
    }
};

// Export transactions data by date range
exports.getTransactionsData = async (req, res) => {
    try {
        console.log('Exporting transactions data with params:', req.query);
        const { startDate, endDate, specificDate } = req.query;
        
        let dateCondition;
        let dateParams;
        
        if (specificDate) {
            // For specific date
            const date = new Date(specificDate);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date < ?';
            dateParams = [date, nextDay];
        } else {
            // For date range
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date <= ?';
            dateParams = [new Date(startDate), new Date(endDate)];
        }
        
        // Query to get all transactions with associated user (cashier) 
        const query = `
            SELECT 
                t.transaction_id AS id,
                t.transaction_date AS date,
                u.full_name AS cashier,
                (SELECT COUNT(*) FROM transaction_items WHERE transaction_id = t.transaction_id) AS items,
                t.total_amount AS total
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            ${dateCondition}
            ORDER BY t.transaction_date DESC
        `;
        
        db.query(query, dateParams, (err, results) => {
            if (err) {
                console.error('Database error when exporting transactions data:', err);
                return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            // Format the response
            const formattedResults = results.map(item => ({
                id: item.id,
                date: new Date(item.date),
                cashier: item.cashier,
                items: parseInt(item.items),
                total: parseFloat(item.total)
            }));
            
            res.json(formattedResults);
        });
    } catch (error) {
        console.error('Error exporting transactions data:', error);
        res.status(500).json({ 
            message: 'Failed to export transactions data', 
            error: error.message 
        });
    }
};

// Export full system data (combining all reports)
exports.getFullData = async (req, res) => {
    try {
        console.log('Exporting full system data with params:', req.query);
        const { startDate, endDate, specificDate } = req.query;
        
        let dateCondition;
        let dateParams;
        
        if (specificDate) {
            // For specific date
            const date = new Date(specificDate);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date < ?';
            dateParams = [date, nextDay];
        } else {
            // For date range
            dateCondition = 'WHERE t.transaction_date >= ? AND t.transaction_date <= ?';
            dateParams = [new Date(startDate), new Date(endDate)];
        }
        
        // Using promises to run multiple queries in parallel
        // 1. Get sales data
        const getSalesData = new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    t.transaction_id,
                    DATE(t.transaction_date) AS date,
                    i.category,
                    SUM(ti.quantity) AS items_sold,
                    SUM(ti.quantity * ti.price) AS revenue
                FROM transactions t
                JOIN transaction_items ti ON t.transaction_id = ti.transaction_id
                JOIN items i ON ti.item_id = i.item_id
                ${dateCondition}
                GROUP BY t.transaction_id, DATE(t.transaction_date), i.category
                ORDER BY date DESC
            `;
            
            db.query(query, dateParams, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        // 2. Get inventory data
        const getInventoryData = new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    item_id,
                    item_name,
                    category,
                    stock_quantity,
                    price
                FROM items
                ORDER BY category, item_name
            `;
            
            db.query(query, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        // 3. Get transaction data
        const getTransactionsData = new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    t.transaction_id,
                    t.transaction_date,
                    u.full_name AS cashier,
                    t.total_amount
                FROM transactions t
                JOIN users u ON t.user_id = u.user_id
                ${dateCondition}
                ORDER BY t.transaction_date DESC
            `;
            
            db.query(query, dateParams, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        // Wait for all queries to complete
        Promise.all([getSalesData, getInventoryData, getTransactionsData])
            .then(([salesResults, inventoryResults, transactionResults]) => {
                // Transform and combine the data
                const combinedData = [
                    // Sales records
                    ...salesResults.map(item => ({
                        id: `S${item.transaction_id}`,
                        type: 'Sales',
                        date: new Date(item.date),
                        details: `${item.category} - ${item.items_sold} items`,
                        value: parseFloat(item.revenue)
                    })),
                    
                    // Inventory records
                    ...inventoryResults.map(item => ({
                        id: `I${item.item_id}`,
                        type: 'Inventory',
                        date: new Date(), // Current date for inventory snapshot
                        details: `${item.item_name} (${item.category})`,
                        value: parseFloat(item.price * item.stock_quantity)
                    })),
                    
                    // Transaction records
                    ...transactionResults.map(item => ({
                        id: `T${item.transaction_id}`,
                        type: 'Transaction',
                        date: new Date(item.transaction_date),
                        details: `Cashier: ${item.cashier}`,
                        value: parseFloat(item.total_amount)
                    }))
                ];
                
                // Sort by date, descending
                combinedData.sort((a, b) => b.date - a.date);
                
                res.json(combinedData);
            })
            .catch(error => {
                console.error('Error executing queries for full data export:', error);
                res.status(500).json({ 
                    message: 'Failed to export full system data', 
                    error: error.message 
                });
            });
    } catch (error) {
        console.error('Error exporting full system data:', error);
        res.status(500).json({ 
            message: 'Failed to export full system data', 
            error: error.message 
        });
    }
};
