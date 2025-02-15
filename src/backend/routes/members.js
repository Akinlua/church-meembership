module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all members
  app.get('/members', async (req, res) => {
    try {
      const members = await prisma.member.findMany({
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching members' });
    }
  });

  // Get single member
  app.get('/members/:id', async (req, res) => {
    try {
      const member = await prisma.member.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching member' });
    }
  });

  // Create member
  app.post('/members', async (req, res) => {
    try {
      const member = await prisma.member.create({
        data: {
          firstName: req.body.first_name,
          middleName: req.body.middle_name,
          lastName: req.body.last_name,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          birthday: req.body.birthday ? new Date(req.body.birthday) : null,
          gender: req.body.gender,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          membershipDate: req.body.membership_date ? new Date(req.body.membership_date) : null,
          baptismalDate: req.body.baptismal_date ? new Date(req.body.baptismal_date) : null
        }
      });
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ message: 'Error creating member' });
    }
  });

  // Update member
  app.put('/members/:id', async (req, res) => {
    try {
      await prisma.member.update({
        where: { id: parseInt(req.params.id) },
        data: {
          firstName: req.body.first_name,
          middleName: req.body.middle_name,
          lastName: req.body.last_name,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          birthday: req.body.birthday ? new Date(req.body.birthday) : null,
          gender: req.body.gender,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          membershipDate: req.body.membership_date ? new Date(req.body.membership_date) : null,
          baptismalDate: req.body.baptismal_date ? new Date(req.body.baptismal_date) : null
        }
      });
      res.json({ message: 'Member updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating member' });
    }
  });
}; 