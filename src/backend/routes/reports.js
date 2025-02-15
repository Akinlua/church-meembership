module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get donation report
  app.get('/reports/donations', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const donations = await prisma.donation.findMany({
        where: {
          donationDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
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
      res.status(500).json({ message: 'Error generating donation report' });
    }
  });

  // Get membership report
  app.get('/reports/members', async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
      const members = await prisma.member.findMany({
        where: {
          membershipDate: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        include: {
          groups: {
            include: {
              group: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });
      res.json(members);
    } catch (error) {
      res.status(500).json({ message: 'Error generating membership report' });
    }
  });

  // Get groups report
  app.get('/reports/groups', async (req, res) => {
    try {
      const groups = await prisma.group.findMany({
        include: {
          members: {
            include: {
              member: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  cellPhone: true,
                  joinedDate: true
                }
              }
            }
          }
        }
      });
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: 'Error generating groups report' });
    }
  });
}; 