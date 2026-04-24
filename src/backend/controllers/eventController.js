const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendEmail, sendSMS } = require('../services/notificationService');

const getEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        group: true,
      },
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

const createEvent = async (req, res) => {
  const { title, description, date, duration, eventType, groupId } = req.body;

  try {
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        duration: duration ? parseInt(duration) : null,
        eventType,
        groupId: groupId ? parseInt(groupId) : null,
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                member: true
              }
            }
          }
        }
      }
    });

    // Handle notifications
    if (newEvent.group && newEvent.group.members && newEvent.group.members.length > 0) {
      const message = `Upcoming event: ${title} on ${new Date(date).toLocaleString()}. Type: ${eventType}.`;
      
      for (const groupMember of newEvent.group.members) {
        const member = groupMember.member;
        if (member) {
          if (member.email) {
            await sendEmail(member.email, `Upcoming Event: ${title}`, message);
          }
          if (member.cellPhone) {
            await sendSMS(member.cellPhone, message);
          }
        }
      }
    }

    res.status(201).json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, description, date, duration, eventType, groupId } = req.body;

  try {
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        date: new Date(date),
        duration: duration ? parseInt(duration) : null,
        eventType,
        groupId: groupId ? parseInt(groupId) : null,
      },
    });
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

const deleteEvent = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.event.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
