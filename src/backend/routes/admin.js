const bcrypt = require('bcrypt');
const { authenticateToken, isAdmin } = require('../middleware/auth');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Middleware to check if user is admin
  const adminMiddleware = [authenticateToken, (req, res, next) => {
    // Super admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check if user has admin access through their user level
    if (req.user.userLevel && req.user.userLevel.adminAccess) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }];

  // Get all users
  app.get('/admin/users', adminMiddleware, async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          createdAt: true,
          passwordChangeRequired: true,
          userLevel: true,
          userLevelId: true
        }
      });
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new user
  app.post('/admin/users', adminMiddleware, async (req, res) => {
    const { name, username, password, userLevelId } = req.body;

    try {
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          passwordChangeRequired: true, // Require password change on first login
          userLevelId: userLevelId ? parseInt(userLevelId) : null
        },
        include: {
          userLevel: true
        }
      });

      res.status(201).json({
        id: user.id,
        name: user.name,
        username: user.username,
        userLevel: user.userLevel
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update a user
  app.put('/admin/users/:id', adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { name, username, password, userLevelId } = req.body;

    try {
      // Check if username is taken by another user
      if (username) {
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      // Prepare update data
      const updateData = {
        name,
        username,
        userLevelId: userLevelId ? parseInt(userLevelId) : null
      };

      // If password is provided, hash it
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
        updateData.passwordChangeRequired = true; // Require password change after admin reset
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          userLevel: true
        }
      });

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        userLevel: user.userLevel
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a user
  app.delete('/admin/users/:id', adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.user.delete({
        where: { id: parseInt(id) }
      });
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Get all user levels
  app.get('/admin/user-levels', adminMiddleware, async (req, res) => {
    try {
      const userLevels = await prisma.userLevel.findMany();
      res.json(userLevels);
    } catch (error) {
      console.error('Error fetching user levels:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new user level
  app.post('/admin/user-levels', adminMiddleware, async (req, res) => {
    const { 
      name, 
      description,
      memberAccess,
      visitorAccess,
      vendorAccess,
      groupAccess,
      donationAccess,
      adminAccess,
      expenseAccess,
      chargesAccess,
      reportsAccess,
      depositAccess,
      bankAccess,
      cannotDeleteMember,
      cannotDeleteVisitor,
      cannotDeleteVendor,
      cannotDeleteGroup,
      cannotDeleteDonation,
      cannotDeleteExpense,
      cannotDeleteCharges,
      cannotDeleteReports,
      cannotDeleteDeposit,
      cannotDeleteBank,
      canAddMember,
      canAddVisitor,
      canAddVendor,
      canAddGroup,
      canAddDonation,
      canAddExpense,
      canAddCharges,
      canAddReports,
      canAddDeposit,
      canAddBank
    } = req.body;

    try {
      // Check if level already exists
      const existingLevel = await prisma.userLevel.findUnique({
        where: { name }
      });

      if (existingLevel) {
        return res.status(400).json({ message: 'User level already exists' });
      }

      // Create level
      const userLevel = await prisma.userLevel.create({
        data: {
          name,
          description,
          memberAccess: memberAccess || false,
          visitorAccess: visitorAccess || false,
          vendorAccess: vendorAccess || false,
          groupAccess: groupAccess || false,
          donationAccess: donationAccess || false,
          adminAccess: adminAccess || false,
          expenseAccess: expenseAccess || false,
          chargesAccess: chargesAccess || false,
          reportsAccess: reportsAccess || false,
          depositAccess: depositAccess || false,
          bankAccess: bankAccess || false,
          cannotDeleteMember: cannotDeleteMember || false,
          cannotDeleteVisitor: cannotDeleteVisitor || false,
          cannotDeleteVendor: cannotDeleteVendor || false,
          cannotDeleteGroup: cannotDeleteGroup || false,
          cannotDeleteDonation: cannotDeleteDonation || false,
          cannotDeleteExpense: cannotDeleteExpense || false,
          cannotDeleteCharges: cannotDeleteCharges || false,
          cannotDeleteReports: cannotDeleteReports || false,
          cannotDeleteDeposit: cannotDeleteDeposit || false,
          cannotDeleteBank: cannotDeleteBank || false,
          canAddMember: canAddMember || false,
          canAddVisitor: canAddVisitor || false,
          canAddVendor: canAddVendor || false,
          canAddGroup: canAddGroup || false,
          canAddDonation: canAddDonation || false,
          canAddExpense: canAddExpense || false,
          canAddCharges: canAddCharges || false,
          canAddReports: canAddReports || false,
          canAddDeposit: canAddDeposit || false,
          canAddBank: canAddBank || false
        }
      });

      res.status(201).json(userLevel);
    } catch (error) {
      console.error('Error creating user level:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}; 