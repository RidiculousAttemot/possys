const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'morpos',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.testConnection = async function() {
    try {
        const connection = await pool.getConnection();
        connection.release();
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = pool;
