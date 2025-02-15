const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get all groups
  router.get('/', authenticateToken, async (req, res) => {
    try {
      const groups = await prisma.group.findMany({
        include: {
          members: {
            include: {
              member: true
            }
          }
        }
      });
      res.json(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ message: 'Error fetching groups' });
    }
  });

  // Create group
  router.post('/groups', async (req, res) => {
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
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { name, description, member_ids } = req.body;
      const groupId = parseInt(req.params.id);

      await prisma.$transaction(async (tx) => {
        // Delete existing members
        await tx.groupMember.deleteMany({
          where: { groupId }
        });

        // Update group and add new members
        const updatedGroup = await tx.group.update({
          where: { id: groupId },
          data: {
            name,
            description,
            members: {
              create: member_ids?.map(memberId => ({
                memberId: parseInt(memberId)
              })) || []
            }
          },
          include: {
            members: {
              include: {
                member: true
              }
            }
          }
        });

        res.json(updatedGroup);
      });
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ message: 'Error updating group' });
    }
  });

  // Get single group with members
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const group = await prisma.group.findUnique({
        where: {
          id: parseInt(req.params.id)
        },
        include: {
          members: {
            include: {
              member: true
            }
          }
        }
      });

      if (!group) {
        return res.status(404).json({ message: 'Group not found' });
      }

      // Transform the data to include member IDs
      const formattedGroup = {
        ...group,
        members: group.members.map(membership => ({
          member_id: membership.member.id,
          firstName: membership.member.firstName,
          lastName: membership.member.lastName
        }))
      };

      res.json(formattedGroup);
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ message: 'Error fetching group' });
    }
  });

  return router;
}; 