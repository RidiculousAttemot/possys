// controllers/users.js

const db = require('../database'); // Database connection
// Removed bcrypt import entirely

// GET all users
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        console.log(`Fetched ${rows.length} users from database`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// GET a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Exclude password field from response
        const [rows] = await db.query(
            'SELECT user_id, username, full_name, email, role, created_at FROM users WHERE user_id = ?', 
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// POST a new user
exports.createUser = async (req, res) => {
    try {
        const { username, password, full_name, email, role } = req.body;
        
        // Validate required fields
        if (!username || !password || !full_name || !email || !role) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if username or email already exists
        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE username = ? OR email = ?', 
            [username, email]
        );
        
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        
        // Store password directly without hashing
        const [result] = await db.query(
            'INSERT INTO users (username, password, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
            [username, password, full_name, email, role]
        );
        
        res.status(201).json({ 
            id: result.insertId,
            message: 'User created successfully' 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

// PUT (update) an existing user by ID
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, password, full_name, email, role } = req.body;
        
        // Start building the SQL query and parameters
        let sql = 'UPDATE users SET ';
        const params = [];
        const updates = [];
        
        // Add fields that are present in the request
        if (username) {
            // Check if username is already taken by another user
            const [existingUser] = await db.query(
                'SELECT * FROM users WHERE username = ? AND user_id != ?', 
                [username, id]
            );
            
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }
            
            updates.push('username = ?');
            params.push(username);
        }
        if (password) {
            // Store password directly without hashing
            updates.push('password = ?');
            params.push(password);
        }
        if (full_name) {
            updates.push('full_name = ?');
            params.push(full_name);
        }
        if (email) {
            // Check if email is already taken by another user
            const [existingUser] = await db.query(
                'SELECT * FROM users WHERE email = ? AND user_id != ?', 
                [email, id]
            );
            
            if (existingUser.length > 0) {
                return res.status(400).json({ error: 'Email already exists' });
            }
            
            updates.push('email = ?');
            params.push(email);
        }
        if (role) {
            updates.push('role = ?');
            params.push(role);
        }
        
        // If no fields to update
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }
        
        // Complete the SQL query
        sql += updates.join(', ') + ' WHERE user_id = ?';
        params.push(id);
        
        // Execute the update
        const [result] = await db.query(sql, params);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// DELETE a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// User login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Validate input
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        
        // Find user by username and password directly
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND password = ?', 
            [username, password]
        );
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const user = users[0];
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        // Include role explicitly in the response
        res.json({
            message: 'Login successful',
            user: {
                ...userWithoutPassword,
                role: user.role // Ensure role is included
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
