const express = require('express');
const router = express.Router();

// Import controllers
const itemsController = require('./controllers/items');
const transactionsController = require('./controllers/transactions');
const usersController = require('./controllers/users');
const imageUploadController = require('./controllers/imageUpload');

// USER routes
router.get('/users', usersController.getAllUsers);
router.get('/users/:id', usersController.getUserById);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);
router.post('/login', usersController.login);

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

// IMAGE UPLOAD route
router.post('/upload-image', imageUploadController.uploadImage);

// Add admin statistics route
router.get('/admin/stats', require('./controllers/admin').getDashboardStats);

// Token validation endpoint
router.post('/validate-token', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    // In a real application, you would verify the JWT token
    // For this simple example, we'll just check if a token exists
    if (!token) {
        return res.status(401).json({ valid: false });
    }
    
    // In a production app, you would verify the token's signature and expiration
    // For simplicity, we're just returning valid: true
    res.json({ valid: true });
});

module.exports = router;
