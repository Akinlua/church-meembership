const { authenticateToken } = require('../middleware/auth');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all expense categories
  app.get('/expense-categories', authenticateToken, async (req, res) => {
    try {
      const expenseCategories = await prisma.expenseCategory.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      res.json(expenseCategories);
    } catch (error) {
      console.error('Error fetching expense categories:', error);
      res.status(500).json({ message: 'Error fetching expense categories' });
    }
  });

  // Get single expense category
  app.get('/expense-categories/:id', authenticateToken, async (req, res) => {
    try {
      const expenseCategory = await prisma.expenseCategory.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      
      if (!expenseCategory) {
        return res.status(404).json({ message: 'Expense category not found' });
      }
      
      res.json(expenseCategory);
    } catch (error) {
      console.error('Error fetching expense category:', error);
      res.status(500).json({ message: 'Error fetching expense category' });
    }
  });

  // Create expense category
  app.post('/expense-categories', authenticateToken, async (req, res) => {
    const { name } = req.body;
    
    try {
      const expenseCategory = await prisma.expenseCategory.create({
        data: { name }
      });
      res.status(201).json(expenseCategory);
    } catch (error) {
      console.error('Error creating expense category:', error);
      res.status(500).json({ message: 'Error creating expense category' });
    }
  });

  // Update expense category
  app.put('/expense-categories/:id', authenticateToken, async (req, res) => {
    const { name } = req.body;
    
    try {
      const expenseCategory = await prisma.expenseCategory.update({
        where: { id: parseInt(req.params.id) },
        data: { name }
      });
      res.json(expenseCategory);
    } catch (error) {
      console.error('Error updating expense category:', error);
      res.status(500).json({ message: 'Error updating expense category' });
    }
  });

  // Delete expense category
  app.delete('/expense-categories/:id', authenticateToken, async (req, res) => {
    try {
      await prisma.expenseCategory.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Expense category deleted successfully' });
    } catch (error) {
      console.error('Error deleting expense category:', error);
      res.status(500).json({ message: 'Error deleting expense category' });
    }
  });
}; 