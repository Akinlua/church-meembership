module.exports = function (app) {
  const prisma = app.get('prisma');
  const express = require('express');
  const router = express.Router();
  
  // Get program owner details
  router.get('/', async (req, res) => {
    try {
      const programOwner = await prisma.programOwner.findFirst();
      res.json(programOwner);
    } catch (error) {
      console.error('Error fetching program owner:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Create program owner
  router.post('/', async (req, res) => {
    try {
      const { church, address, city, state, zip, phone, webAddress, pastor } = req.body;
      
      // Check if program owner already exists
      const existing = await prisma.programOwner.findFirst();
      
      if (existing) {
        return res.status(400).json({ error: 'Program owner already exists, use PUT to update' });
      }
      
      const programOwner = await prisma.programOwner.create({
        data: {
          church,
          address,
          city,
          state,
          zip,
          phone,
          webAddress,
          pastor
        }
      });
      
      res.status(201).json(programOwner);
    } catch (error) {
      console.error('Error creating program owner:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Update program owner
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { church, address, city, state, zip, phone, webAddress, pastor } = req.body;
      
      const programOwner = await prisma.programOwner.update({
        where: { id: parseInt(id) },
        data: {
          church,
          address,
          city,
          state,
          zip,
          phone,
          webAddress,
          pastor
        }
      });
      
      res.json(programOwner);
    } catch (error) {
      console.error('Error updating program owner:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  app.use('/program-owner', router);
  return router;
}; 