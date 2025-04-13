const db = require('../database');  // MySQL connection
const express = require('express');
const router = express.Router();

// Create a new order
router.post('/create', (req, res) => {
    const { customer_name, total_amount, status, items } = req.body;

    if (!customer_name || !total_amount || !status || !items) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const query = 'INSERT INTO orders (customer_name, total_amount, status, items) VALUES (?, ?, ?, ?)';
    db.execute(query, [customer_name, total_amount, status, JSON.stringify(items)], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to create order.", error: err });
        }
        res.status(201).json({ message: "Order created successfully.", orderId: result.insertId });
    });
});

// Get all orders
router.get('/', (req, res) => {
    const query = 'SELECT * FROM orders';
    db.execute(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to retrieve orders.", error: err });
        }
        res.status(200).json(result);
    });
});

// Get a single order by ID
router.get('/:id', (req, res) => {
    const orderId = req.params.id;

    const query = 'SELECT * FROM orders WHERE id = ?';
    db.execute(query, [orderId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to retrieve order.", error: err });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json(result[0]);
    });
});

// Update an order
router.put('/:id', (req, res) => {
    const orderId = req.params.id;
    const { customer_name, total_amount, status, items } = req.body;

    if (!customer_name || !total_amount || !status || !items) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const query = 'UPDATE orders SET customer_name = ?, total_amount = ?, status = ?, items = ? WHERE id = ?';
    db.execute(query, [customer_name, total_amount, status, JSON.stringify(items), orderId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to update order.", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json({ message: "Order updated successfully." });
    });
});

// Delete an order
router.delete('/:id', (req, res) => {
    const orderId = req.params.id;

    const query = 'DELETE FROM orders WHERE id = ?';
    db.execute(query, [orderId], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Failed to delete order.", error: err });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found." });
        }
        res.status(200).json({ message: "Order deleted successfully." });
    });
});

module.exports = router;
