const express = require('express');
const router = express.Router();

// Import controllers
const itemsController = require('./controllers/items');
const transactionsController = require('./controllers/transactions');
const usersController = require('./controllers/users');
const imageUploadController = require('./controllers/imageUpload');
const exportDataController = require('./controllers/exportData');
const resetController = require('./controllers/reset');
const auditController = require('./controllers/audit');
const auditMiddleware = require('./middleware/auditMiddleware');
const authMiddleware = require('./middleware/authMiddleware');
const { extractBearerToken, verifyAuthToken } = require('./utils/auth');

router.post('/login', usersController.login);

// Token validation endpoint
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

// USER routes
router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

// Inventory routes
router.get('/inventory', itemsController.getInventory);
router.get('/inventory/:id', itemsController.getItemById);
router.post('/inventory', itemsController.addItem);
router.put('/inventory/:id', itemsController.updateItem);
router.delete('/inventory/:id', itemsController.deleteItem);

// TRANSACTION routes
router.get('/transactions', transactionsController.getAllTransactions);
router.get('/transactions/:id', transactionsController.getTransactionById);
router.post('/transactions', transactionsController.createTransaction);
router.get('/transaction-stats', transactionsController.getTransactionStats);

// RESET routes
router.delete('/reset/transactions', resetController.resetTransactions);
router.delete('/reset/inventory', resetController.resetInventory);
router.delete('/reset/users', resetController.resetUsers);

// IMAGE UPLOAD route
router.post('/upload-image', imageUploadController.uploadImage);

// Add admin statistics route
router.get('/admin/stats', require('./controllers/admin').getDashboardStats);

// Audit log routes
router.post('/audit-events', auditController.recordEvent);
router.get('/audit-logs', auditController.getAuditLogs);
router.get('/audit-logs/summary', auditController.getAuditSummary);

// Add export data routes
router.get('/export/sales', exportDataController.getSalesData);
router.get('/export/inventory', exportDataController.getInventoryData);
router.get('/export/transactions', exportDataController.getTransactionsData);
router.get('/export/full', exportDataController.getFullData);

module.exports = router;
