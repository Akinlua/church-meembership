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
}; 