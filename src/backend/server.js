require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// Make Prisma available to routes
app.set('prisma', prisma);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Apply authentication middleware to protected routes
app.use(['/members', '/groups', '/donations', '/reports', '/dashboard'], authenticateToken);

// Make authenticateToken available to routes
app.set('authenticateToken', authenticateToken);

// Routes
require('./routes/auth')(app);
require('./routes/members')(app);
require('./routes/groups')(app);
require('./routes/donations')(app);
require('./routes/reports')(app);
require('./routes/dashboard')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 