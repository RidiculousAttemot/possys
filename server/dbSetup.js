// Database setup script to create tables

const db = require('./database');

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        role ENUM('admin', 'cashier', 'manager') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Create items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        item_id INT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(50) NOT NULL,
        stock_quantity INT NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Items table created or already exists');

    // Create transactions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('card', 'cash', 'online') NOT NULL,
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);
    console.log('Transactions table created or already exists');

    // Create transaction_items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        transaction_item_id INT AUTO_INCREMENT PRIMARY KEY,
        transaction_id INT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE
      )
    `);
    console.log('Transaction_items table created or already exists');

    // Check if admin user exists
    const [adminRows] = await db.query('SELECT * FROM users WHERE role = "admin" LIMIT 1');
    
    // Create default admin user if none exists
    if (!adminRows || adminRows.length === 0) {
      await db.query(`
        INSERT INTO users (username, password, full_name, email, role)
        VALUES ('admin', 'admin123', 'Admin User', 'admin@motortech.com', 'admin')
      `);
      console.log('Default admin user created');
    }

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase().then(() => process.exit());
} else {
  // Export for use in other files
  module.exports = setupDatabase;
}
