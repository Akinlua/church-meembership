const { authenticateToken } = require('../middleware/auth');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all charges with relations
  app.get('/charges', authenticateToken, async (req, res) => {
    try {
      const charges = await prisma.charge.findMany({
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          dueDate: 'desc'
        }
      });
      res.json(charges);
    } catch (error) {
      console.error('Error fetching charges:', error);
      res.status(500).json({ message: 'Error fetching charges' });
    }
  });

  // Get single charge with relations
  app.get('/charges/:id', authenticateToken, async (req, res) => {
    try {
      const charge = await prisma.charge.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          vendor: true,
          expenseCategory: true
        }
      });
      
      if (!charge) {
        return res.status(404).json({ message: 'Charge not found' });
      }
      
      res.json(charge);
    } catch (error) {
      console.error('Error fetching charge:', error);
      res.status(500).json({ message: 'Error fetching charge' });
    }
  });

  // Create charge
  app.post('/charges', authenticateToken, async (req, res) => {
    const { vendorId, expenseCategoryId, amount, dueDate, description } = req.body;
    
    try {
      const charge = await prisma.charge.create({
        data: { 
          vendorId: parseInt(vendorId),
          expenseCategoryId: parseInt(expenseCategoryId),
          amount: parseFloat(amount),
          dueDate: new Date(dueDate),
        }
      });
      
      // Return the created charge with its relations
      const chargeWithRelations = await prisma.charge.findUnique({
        where: { id: charge.id },
        include: {
          vendor: true,
          expenseCategory: true
        }
      });
      
      res.status(201).json(chargeWithRelations);
    } catch (error) {
      console.error('Error creating charge:', error);
      res.status(500).json({ message: 'Error creating charge' });
    }
  });

  // Update charge
  app.put('/charges/:id', authenticateToken, async (req, res) => {
    const { vendorId, expenseCategoryId, amount, dueDate, description, isPaid, markedForPayment } = req.body;
    
    try {
      const charge = await prisma.charge.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          vendor: { connect: { id: parseInt(vendorId) } },
          expenseCategory: { connect: { id: parseInt(expenseCategoryId) } },
          amount: parseFloat(amount),
          dueDate: new Date(dueDate),
          isPaid: isPaid === true,
          markedForPayment: markedForPayment === true,
        },
      });
      
      res.json(charge);
    } catch (error) {
      console.error('Error updating charge:', error);
      res.status(500).json({ error: 'Failed to update charge' });
    }
  });

  // Delete charge
  app.delete('/charges/:id', authenticateToken, async (req, res) => {
    try {
      await prisma.charge.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Charge deleted successfully' });
    } catch (error) {
      console.error('Error deleting charge:', error);
      res.status(500).json({ message: 'Error deleting charge' });
    }
  });

  // Get charges marked for payment
  app.get('/charges/payment', authenticateToken, async (req, res) => {
    try {
      const charges = await prisma.charge.findMany({
        where: { markedForPayment: true },
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          vendorId: 'asc'
        }
      });
      res.json(charges);
    } catch (error) {
      console.error('Error fetching charges marked for payment:', error);
      res.status(500).json({ message: 'Error fetching charges marked for payment' });
    }
  });
}; 