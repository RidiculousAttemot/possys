const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

async function startServer() {
    try {
        const dbConnected = await db.testConnection();
        if (!dbConnected) {
            process.exit(1);
        }
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        server.on('error', (error) => {
            if (error && error.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is already in use. Reusing existing running server.`);
                process.exit(0);
                return;
            }

            console.error('Server failed to start:', error);
            process.exit(1);
        });
    } catch (error) {
        process.exit(1);
    }
}
startServer();
