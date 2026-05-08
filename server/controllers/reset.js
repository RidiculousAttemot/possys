 // controllers/reset.js
const db = require('../database');

const runInTransaction = async (fn) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const result = await fn(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// DELETE reset transactions (including transaction items)
exports.resetTransactions = async (req, res) => {
    try {
        const result = await runInTransaction(async (connection) => {
            const [itemsResult] = await connection.query('DELETE FROM transaction_items');
            const [transactionsResult] = await connection.query('DELETE FROM transactions');
            return {
                transactionItemsDeleted: itemsResult.affectedRows || 0,
                transactionsDeleted: transactionsResult.affectedRows || 0
            };
        });

        res.json({
            message: 'Transactions reset successfully',
            ...result
        });
    } catch (error) {
        console.error('Error resetting transactions:', error);
        res.status(500).json({ error: 'Failed to reset transactions' });
    }
};

// DELETE reset inventory (items) and related transaction items
exports.resetInventory = async (req, res) => {
    try {
        const result = await runInTransaction(async (connection) => {
            const [itemsRelResult] = await connection.query('DELETE FROM transaction_items');
            const [itemsResult] = await connection.query('DELETE FROM items');
            return {
                transactionItemsDeleted: itemsRelResult.affectedRows || 0,
                itemsDeleted: itemsResult.affectedRows || 0
            };
        });

        res.json({
            message: 'Inventory reset successfully',
            ...result
        });
    } catch (error) {
        console.error('Error resetting inventory:', error);
        res.status(500).json({ error: 'Failed to reset inventory' });
    }
};

// DELETE reset users (preserve admin accounts)
exports.resetUsers = async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM users WHERE role != ?', ['admin']);

        res.json({
            message: 'Users reset successfully (admins preserved)',
            usersDeleted: result.affectedRows || 0
        });
    } catch (error) {
        console.error('Error resetting users:', error);
        res.status(500).json({ error: 'Failed to reset users' });
    }
};
