const express = require('express');
const router = express.Router();

// Import controllers
const itemsController = require('../controllers/items');
const usersController = require('../controllers/users');
const transactionsController = require('../controllers/transactions');
const adminController = require('../controllers/admin');
const exportDataController = require('../controllers/exportData');
const auditController = require('../controllers/audit');
const auditMiddleware = require('../middleware/auditMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { extractBearerToken, verifyAuthToken } = require('../utils/auth');

router.post('/login', usersController.login);

router.post('/validate-token', (req, res) => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
        return res.status(401).json({ valid: false });
    }

    try {
        const user = verifyAuthToken(token);
        return res.json({ valid: true, user });
    } catch (error) {
        return res.status(401).json({ valid: false });
    }
});

router.use(authMiddleware);
router.use(auditMiddleware);

// Items/Inventory routes
router.get('/inventory', itemsController.getInventory);
router.get('/inventory/:id', itemsController.getItemById);
router.post('/inventory', itemsController.createItem);
router.put('/inventory/:id', itemsController.updateItem);
router.delete('/inventory/:id', itemsController.deleteItem);

// User routes
router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

// Transaction routes
router.get('/transactions', transactionsController.getAllTransactions);
router.get('/transactions/user/:userId', transactionsController.getTransactionsByUserId);
router.get('/transactions/:id', transactionsController.getTransactionById);
router.post('/transactions', transactionsController.createTransaction);
router.get('/transaction-stats', transactionsController.getTransactionStats);

// Admin routes
router.get('/admin-info', adminController.getAdminInfo);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/reports/:type', adminController.generateReport);

// Export data routes
router.get('/export/sales', exportDataController.getSalesData);
router.get('/export/inventory', exportDataController.getInventoryData);
router.get('/export/transactions', exportDataController.getTransactionsData);
router.get('/export/full', exportDataController.getFullData);

// Audit routes
router.post('/audit-events', auditController.recordEvent);
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/summary', auditController.getAuditSummary);

// Database check - simple health check endpoint
router.get('/', (req, res) => {
    res.json({ message: 'API is working properly', status: 'online' });
});

module.exports = router;
