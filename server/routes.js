const express = require('express');
const router = express.Router();

const userController = require('./controllers/user');
const itemController = require('./controllers/items');
const adminController = require('./controllers/admin');
const transactionController = require('./controllers/transactions');

// LOGIN route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await userController.login(username, password);
  return res.status(result.status).json(result.data);
});

// ADMIN routes
router.get('/admin', adminController.getAdminInfo);
router.get('/stats', adminController.getDashboardStats);
router.get('/reports/:type', adminController.generateReport);

// USER routes
router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);

// INVENTORY routes - using items instead of products
router.get('/inventory', itemController.getInventory);
router.post('/inventory', itemController.addItem);
router.put('/inventory/:id', itemController.updateItem);
router.delete('/inventory/:id', itemController.deleteItem);

// TRANSACTION routes
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:id', transactionController.getTransactionById);
router.post('/transactions', transactionController.createTransaction);
router.get('/transaction-stats', transactionController.getTransactionStats);

module.exports = router;
