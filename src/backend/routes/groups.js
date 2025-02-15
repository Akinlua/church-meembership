module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all groups with members
  app.get('/groups', async (req, res) => {
    try {
      const groups = await prisma.group.findMany({
        include: {
          members: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching groups' });
    }
  });

  // Create group
  app.post('/groups', async (req, res) => {
    const { name, description, members } = req.body;

    try {
      const group = await prisma.group.create({
        data: {
          name,
          description,
          members: {
            create: members?.map(memberId => ({
              member: {
                connect: { id: parseInt(memberId) }
              }
            })) || []
          }
        }
      });
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ message: 'Error creating group' });
    }
  });

  // Update group
  app.put('/groups/:id', async (req, res) => {
    const { name, description, members } = req.body;
    const groupId = parseInt(req.params.id);

    try {
      await prisma.$transaction(async (tx) => {
        // Delete existing members
        await tx.groupMember.deleteMany({
          where: { groupId }
        });

        // Update group and add new members
        await tx.group.update({
          where: { id: groupId },
          data: {
            name,
            description,
            members: {
              create: members?.map(memberId => ({
                member: {
                  connect: { id: parseInt(memberId) }
                }
              })) || []
            }
          }
        });
      });

      res.json({ message: 'Group updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating group' });
    }
  });
}; 