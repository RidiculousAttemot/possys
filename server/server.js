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
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        process.exit(1);
    }
}
startServer();
