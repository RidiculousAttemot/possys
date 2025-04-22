const express = require('express');
const router = express.Router();

// Import controllers
const itemsController = require('../controllers/items');
const usersController = require('../controllers/users');
const transactionsController = require('../controllers/transactions');
const adminController = require('../controllers/admin');

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
router.post('/login', usersController.login);

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

// Database check - simple health check endpoint
router.get('/', (req, res) => {
    res.json({ message: 'API is working properly', status: 'online' });
});

module.exports = router;
