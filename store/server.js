const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./src/config/database');
const apiRoutes = require('./src/routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB(); // Ensure MongoDB is running

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// View routes (Simple static file serving for this structure)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'views/index.html')));
app.get('/detail', (req, res) => res.sendFile(path.join(__dirname, 'views/detail.html')));
app.get('/cart', (req, res) => res.sendFile(path.join(__dirname, 'views/cart.html')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
