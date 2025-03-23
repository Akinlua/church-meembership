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
    
    // Check if user has admin access directly
    if (req.user.adminAccess) {
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
          role: true,
          memberAccess: true,
          visitorAccess: true,
          vendorAccess: true,
          groupAccess: true,
          donationAccess: true,
          adminAccess: true,
          expenseAccess: true,
          chargesAccess: true,
          reportsAccess: true,
          depositAccess: true,
          bankAccess: true,
          cannotDeleteMember: true,
          cannotDeleteVisitor: true,
          cannotDeleteVendor: true,
          cannotDeleteGroup: true,
          cannotDeleteDonation: true,
          cannotDeleteExpense: true,
          cannotDeleteCharges: true,
          cannotDeleteReports: true,
          cannotDeleteDeposit: true,
          cannotDeleteBank: true,
          canAddMember: true,
          canAddVisitor: true,
          canAddVendor: true,
          canAddGroup: true,
          canAddDonation: true,
          canAddExpense: true,
          canAddCharges: true,
          canAddReports: true,
          canAddDeposit: true,
          canAddBank: true
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
    const { 
      name, 
      username, 
      password,
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
      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user with direct permissions
      const user = await prisma.user.create({
        data: {
          name,
          username,
          password: hashedPassword,
          passwordChangeRequired: true, // Require password change on first login
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
          cannotDeleteMember: cannotDeleteMember !== undefined ? cannotDeleteMember : true,
          cannotDeleteVisitor: cannotDeleteVisitor !== undefined ? cannotDeleteVisitor : true,
          cannotDeleteVendor: cannotDeleteVendor !== undefined ? cannotDeleteVendor : true,
          cannotDeleteGroup: cannotDeleteGroup !== undefined ? cannotDeleteGroup : true,
          cannotDeleteDonation: cannotDeleteDonation !== undefined ? cannotDeleteDonation : true,
          cannotDeleteExpense: cannotDeleteExpense !== undefined ? cannotDeleteExpense : true,
          cannotDeleteCharges: cannotDeleteCharges !== undefined ? cannotDeleteCharges : true,
          cannotDeleteReports: cannotDeleteReports !== undefined ? cannotDeleteReports : true,
          cannotDeleteDeposit: cannotDeleteDeposit !== undefined ? cannotDeleteDeposit : true,
          cannotDeleteBank: cannotDeleteBank !== undefined ? cannotDeleteBank : true,
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

      res.status(201).json({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        memberAccess: user.memberAccess,
        visitorAccess: user.visitorAccess,
        vendorAccess: user.vendorAccess,
        groupAccess: user.groupAccess,
        donationAccess: user.donationAccess,
        adminAccess: user.adminAccess,
        expenseAccess: user.expenseAccess,
        chargesAccess: user.chargesAccess,
        reportsAccess: user.reportsAccess,
        depositAccess: user.depositAccess,
        bankAccess: user.bankAccess
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Update a user
  app.put('/admin/users/:id', adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { 
      name, 
      username, 
      password,
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
      // Check if username is taken by another user
      if (username) {
        const existingUser = await prisma.user.findUnique({
          where: { username }
        });

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      // Prepare update data with permissions
      const updateData = {
        name,
        username,
        memberAccess: memberAccess !== undefined ? memberAccess : undefined,
        visitorAccess: visitorAccess !== undefined ? visitorAccess : undefined,
        vendorAccess: vendorAccess !== undefined ? vendorAccess : undefined,
        groupAccess: groupAccess !== undefined ? groupAccess : undefined,
        donationAccess: donationAccess !== undefined ? donationAccess : undefined,
        adminAccess: adminAccess !== undefined ? adminAccess : undefined,
        expenseAccess: expenseAccess !== undefined ? expenseAccess : undefined,
        chargesAccess: chargesAccess !== undefined ? chargesAccess : undefined,
        reportsAccess: reportsAccess !== undefined ? reportsAccess : undefined,
        depositAccess: depositAccess !== undefined ? depositAccess : undefined,
        bankAccess: bankAccess !== undefined ? bankAccess : undefined,
        cannotDeleteMember: cannotDeleteMember !== undefined ? cannotDeleteMember : undefined,
        cannotDeleteVisitor: cannotDeleteVisitor !== undefined ? cannotDeleteVisitor : undefined,
        cannotDeleteVendor: cannotDeleteVendor !== undefined ? cannotDeleteVendor : undefined,
        cannotDeleteGroup: cannotDeleteGroup !== undefined ? cannotDeleteGroup : undefined,
        cannotDeleteDonation: cannotDeleteDonation !== undefined ? cannotDeleteDonation : undefined,
        cannotDeleteExpense: cannotDeleteExpense !== undefined ? cannotDeleteExpense : undefined,
        cannotDeleteCharges: cannotDeleteCharges !== undefined ? cannotDeleteCharges : undefined,
        cannotDeleteReports: cannotDeleteReports !== undefined ? cannotDeleteReports : undefined,
        cannotDeleteDeposit: cannotDeleteDeposit !== undefined ? cannotDeleteDeposit : undefined,
        cannotDeleteBank: cannotDeleteBank !== undefined ? cannotDeleteBank : undefined,
        canAddMember: canAddMember !== undefined ? canAddMember : undefined,
        canAddVisitor: canAddVisitor !== undefined ? canAddVisitor : undefined,
        canAddVendor: canAddVendor !== undefined ? canAddVendor : undefined,
        canAddGroup: canAddGroup !== undefined ? canAddGroup : undefined,
        canAddDonation: canAddDonation !== undefined ? canAddDonation : undefined,
        canAddExpense: canAddExpense !== undefined ? canAddExpense : undefined,
        canAddCharges: canAddCharges !== undefined ? canAddCharges : undefined,
        canAddReports: canAddReports !== undefined ? canAddReports : undefined,
        canAddDeposit: canAddDeposit !== undefined ? canAddDeposit : undefined,
        canAddBank: canAddBank !== undefined ? canAddBank : undefined
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // If password is provided, hash it
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
        updateData.passwordChangeRequired = true; // Require password change after admin reset
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        memberAccess: user.memberAccess,
        visitorAccess: user.visitorAccess,
        vendorAccess: user.vendorAccess,
        groupAccess: user.groupAccess,
        donationAccess: user.donationAccess,
        adminAccess: user.adminAccess,
        expenseAccess: user.expenseAccess,
        chargesAccess: user.chargesAccess,
        reportsAccess: user.reportsAccess,
        depositAccess: user.depositAccess,
        bankAccess: user.bankAccess
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

  // Keep the user-levels endpoints for backward compatibility
  // These can be removed once the migration is complete
  
  // Get all user levels (deprecated)
  app.get('/admin/user-levels', adminMiddleware, async (req, res) => {
    try {
      const userLevels = await prisma.userLevel.findMany();
      res.json(userLevels);
    } catch (error) {
      console.error('Error fetching user levels:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Create a new user level (deprecated)
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

  // Update a user level (deprecated)
  app.put('/admin/user-levels/:id', adminMiddleware, async (req, res) => {
    // Keep implementation for backward compatibility
    const { id } = req.params;
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
      // Check if name exists for another level
      const existingLevel = await prisma.userLevel.findUnique({
        where: { name }
      });

      if (existingLevel && existingLevel.id !== parseInt(id)) {
        return res.status(400).json({ message: 'User level with this name already exists' });
      }

      // Update level
      const userLevel = await prisma.userLevel.update({
        where: { id: parseInt(id) },
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

      res.json(userLevel);
    } catch (error) {
      console.error('Error updating user level:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Delete a user level (deprecated)
  app.delete('/admin/user-levels/:id', adminMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.userLevel.delete({
        where: { id: parseInt(id) }
      });
      res.json({ message: 'User level deleted successfully' });
    } catch (error) {
      console.error('Error deleting user level:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
}; 