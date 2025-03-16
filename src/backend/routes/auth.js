const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

module.exports = (app) => {
  const prisma = app.get('prisma');

  app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          userLevel: true
        }
      });

      if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          name: user.name,
          username: user.username, 
          userLevelId: user.userLevelId,
          userLevel: user.userLevel,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          userLevel: user.userLevel,
          role: user.role
        },
        passwordChangeRequired: user.passwordChangeRequired
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/auth/signup', async (req, res) => {
    const { name, username, password, confirmPassword } = req.body;

    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword
        }
      });

      const token = jwt.sign(
        { id: user.id, name: user.name, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({ 
        token, 
        user: { 
          id: user.id, 
          name: user.name,
          username: user.username 
        } 
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/auth/verify', authenticateToken, async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          passwordChangeRequired: true,
          userLevel: true,
          role: true
        }
      });

      if (!user) {
        return res.status(404).json({ valid: false });
      }

      res.json({
        valid: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          userLevel: user.userLevel,
          role: user.role
        },
        passwordChangeRequired: user.passwordChangeRequired
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({ valid: false });
    }
  });

  app.post('/auth/change-password', authenticateToken, async (req, res) => {
    const { newPassword } = req.body;
    const userId = req.user.id;

    try {
      // Validate password
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChangeRequired: false
        }
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}; 