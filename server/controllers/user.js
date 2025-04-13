// controllers/user.js

const db = require('../database'); // Database connection

// Login function
exports.login = async (username, password) => {
  if (!username || !password) {
    return {
      status: 400,
      data: { error: 'Username and password are required' }
    };
  }

  try {
    // Use parameterized query to avoid SQL injection
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const [rows] = await db.query(sql, [username, password]);

    if (!rows || rows.length === 0) {
      return {
        status: 401,
        data: { error: 'Invalid credentials' }
      };
    }

    const user = rows[0]; // We expect one matching user
    const role = user.role; // Get the role from DB

    return {
      status: 200,
      data: {
        message: 'Login successful',
        user: {
          id: user.user_id,
          username: user.username,
          name: user.full_name,
          email: user.email,
          role: user.role
        },
        role,
        token: 'dummy-token-' + Date.now() // Add a simple token for auth
      }
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      status: 500,
      data: { error: 'Internal server error' }
    };
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Fetch users with correct column names
    const [rows] = await db.query('SELECT user_id, username, full_name, email, role FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, full_name, email, role } = req.body;

    // Validate required fields
    if (!username || !password || !full_name || !email || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const [existingUsers] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Insert new user with correct column names
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

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, password } = req.body;

    // Start building the SQL query and parameters
    let sql = 'UPDATE users SET ';
    const params = [];
    const updates = [];

    // Add fields that are present in the request
    if (full_name) {
      updates.push('full_name = ?');
      params.push(full_name);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role) {
      updates.push('role = ?');
      params.push(role);
    }
    if (password) {
      updates.push('password = ?');
      params.push(password);
    }

    // If no fields to update
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Complete the SQL query with correct primary key column
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

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Use correct primary key column name
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
