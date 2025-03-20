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
app.use('/uploads', express.static('public/uploads'));
app.use(['/members', '/groups', '/donations', '/reports', '/dashboard', '/visitors', '/vendors', '/expense-categories', '/charges', '/admin', '/program-owner'], authenticateToken);

// Make authenticateToken available to routes
app.set('authenticateToken', authenticateToken);

// Routes
require('./routes/auth')(app);
require('./routes/members')(app);
const groupsRouter = require('./routes/groups')(app);
app.use('/groups', groupsRouter);
require('./routes/donations')(app);
const reportsRouter = require('./routes/reports')(app);
app.use('/reports', reportsRouter);
require('./routes/dashboard')(app);
require('./routes/visitors')(app);
require('./routes/vendors')(app);
require('./routes/expenseCategories')(app);
require('./routes/charges')(app);
require('./routes/admin')(app);
require('./routes/programOwner')(app);

const bankRoutes = require('./routes/banks');
const depositRoutes = require('./routes/deposits');
app.use('/banks', bankRoutes);
app.use('/deposits', depositRoutes);

async function start() {
    await prisma.$connect();
    console.log('Connected to database');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    }); 
}

start();

