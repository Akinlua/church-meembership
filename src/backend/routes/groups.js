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
  router.post('/', authenticateToken, async (req, res) => {
    const { name, description, member_ids } = req.body;

    try {
      const group = await prisma.group.create({
        data: {
          name,
          description,
          members: {
            create: member_ids?.map(memberId => ({
              memberId: parseInt(memberId)
            })) || []
          }
        }
      });
      res.status(201).json(group);
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ message: 'Error creating group' });
    }
  });

  // Update group
  router.put('/:id', authenticateToken, async (req, res) => {
    try {
      const { name, description, member_ids } = req.body;
      const groupId = parseInt(req.params.id);

      const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: {
          name,
          description,
          members: {
            deleteMany: {}, // Remove all existing connections
            create: member_ids.map(memberId => ({
              member: {
                connect: { id: parseInt(memberId) }
              }
            }))
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
    } catch (error) {
      console.error('Error updating group:', error);
      res.status(500).json({ message: 'Error updating group' });
    }
  });

  // Get specific group with members
  router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const group = await prisma.group.findUnique({
        where: { id: parseInt(req.params.id) },
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
      
      // Format the response to include member details
      const formattedGroup = {
        ...group,
        members: group.members.map(membership => membership.member)
      };
      
      res.json(formattedGroup);
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ message: 'Error fetching group' });
    }
  });

  // Delete group
  router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);

      // First delete all member relationships
      await prisma.groupMember.deleteMany({
        where: {
          groupId: groupId
        }
      });

      // Then delete the group
      await prisma.group.delete({
        where: {
          id: groupId
        }
      });

      res.json({ message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Error deleting group:', error);
      res.status(500).json({ message: 'Error deleting group' });
    }
  });

  return router;
}; 