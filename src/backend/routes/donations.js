const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all donations with member details
  app.get('/donations', async (req, res) => {
    try {
      const donations = await prisma.donation.findMany({
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          donationDate: 'desc'
        }
      });
      res.json(donations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching donations' });
    }
  });

  // Create donation
  app.post('/donations', async (req, res) => {
    const { member_id, amount, donation_type, donation_date, notes } = req.body;

    try {
      const donation = await prisma.donation.create({
        data: {
          memberId: parseInt(member_id),
          amount: parseFloat(amount),
          donationType: donation_type,
          donationDate: new Date(donation_date),
          notes: notes
        }
      });
      res.status(201).json(donation);
    } catch (error) {
      console.error('Error creating donation:', error);
      res.status(500).json({ message: 'Error creating donation', error: error.message });
    }
  });

  // Update donation
  app.put('/donations/:id', async (req, res) => {
    try {
      await prisma.donation.update({
        where: { id: parseInt(req.params.id) },
        data: {
          memberId: parseInt(req.body.member_id),
          amount: parseFloat(req.body.amount),
          donationDate: new Date(req.body.donation_date),
          donationType: req.body.donation_type,
          notes: req.body.notes
        }
      });
      res.json({ message: 'Donation updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating donation' });
    }
  });

  // Add delete endpoint for donations
  app.delete('/donations/:id', async (req, res) => {
    try {
      await prisma.donation.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Donation deleted successfully' });
    } catch (error) {
      console.error('Error deleting donation:', error);
      res.status(500).json({ message: 'Error deleting donation' });
    }
  });

  // Add this route to fetch donation types
  app.get('/donation-types', async (req, res) => {
    try {
      const donationTypes = await prisma.donationType.findMany(); // Assuming you have a donationType model
      res.json(donationTypes);
    } catch (error) {
      console.error('Error fetching donation types:', error);
      res.status(500).json({ message: 'Error fetching donation types' });
    }
  });

   // Get all donation types
   app.get('/donation-types', authenticateToken, async (req, res) => {
    try {
      const donationTypes = await prisma.donationType.findMany();
      res.json(donationTypes);
    } catch (error) {
      console.error('Error fetching donation types:', error);
      res.status(500).json({ message: 'Error fetching donation types' });
    }
  });

  // Add a new donation type
  app.post('/donation-types', authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    try {
      const newType = await prisma.donationType.create({
        data: { name, description }
      });
      res.status(201).json(newType);
    } catch (error) {
      console.error('Error adding donation type:', error);
      res.status(500).json({ message: 'Error adding donation type' });
    }
  });

  // Edit a donation type
  app.put('/donation-types/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    try {
      const updatedType = await prisma.donationType.update({
        where: { id: parseInt(id) },
        data: { name, description }
      });
      res.json(updatedType);
    } catch (error) {
      console.error('Error updating donation type:', error);
      res.status(500).json({ message: 'Error updating donation type' });
    }
  });

  // Delete a donation type
  app.delete('/donation-types/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.donationType.delete({
        where: { id: parseInt(id) }
      });
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting donation type:', error);
      res.status(500).json({ message: 'Error deleting donation type' });
    }
  });

  // Add this route to get a specific donation type by ID
  app.get('/donation-types/:id', authenticateToken, async (req, res) => {
    try {
      const donationType = await prisma.donationType.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      
      if (!donationType) {
        return res.status(404).json({ message: 'Donation type not found' });
      }
      
      res.json(donationType);
    } catch (error) {
      console.error('Error fetching donation type:', error);
      res.status(500).json({ message: 'Error fetching donation type' });
    }
  });

  // Add this route to download donation types as a PDF
  app.get('/donation-types/download', authenticateToken, async (req, res) => {
    try {
      const donationTypes = await prisma.donationType.findMany({
        select: {
          name: true,
          description: true
        }
      });

      const doc = new PDFDocument();
      const passThrough = new PassThrough();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=donation_types_report.pdf');

      doc.pipe(passThrough);
      doc.pipe(res);

      doc.fontSize(20).text('Donation Types Report', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text('Name', { continued: true }).text('Description', { align: 'right' });
      doc.moveDown();

      donationTypes.forEach(type => {
        doc.text(type.name, { continued: true }).text(type.description, { align: 'right' });
        doc.moveDown();
      });

      doc.end();
    } catch (error) {
      console.error('Error generating donation types report:', error);
      res.status(500).json({ message: 'Error generating donation types report' });
    }
  });

  // Get a specific donation by ID
  app.get('/donations/:id', async (req, res) => {
    try {
      const donation = await prisma.donation.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      if (!donation) {
        return res.status(404).json({ message: 'Donation not found' });
      }
      
      res.json(donation);
    } catch (error) {
      console.error('Error fetching donation details:', error);
      res.status(500).json({ message: 'Error fetching donation details' });
    }
  });
}; 