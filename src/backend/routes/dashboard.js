module.exports = (app) => {
  const prisma = app.get('prisma');

  // Get dashboard statistics
  app.get('/dashboard/stats', async (req, res) => {
    try {
      const [
        memberCount,
        groupCount,
        recentDonations,
        upcomingBirthdays
      ] = await Promise.all([
        // Get total members
        prisma.member.count(),
        
        // Get total groups
        prisma.group.count(),
        
        // Get recent donations
        prisma.donation.findMany({
          take: 5,
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
        }),
        
        // Get upcoming birthdays (next 30 days)
        prisma.$queryRaw`
          SELECT * FROM members 
          WHERE EXTRACT(MONTH FROM birthday) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(DAY FROM birthday) >= EXTRACT(DAY FROM CURRENT_DATE)
          AND EXTRACT(DAY FROM birthday) <= EXTRACT(DAY FROM CURRENT_DATE + INTERVAL '30 days')
          ORDER BY EXTRACT(MONTH FROM birthday), EXTRACT(DAY FROM birthday)
          LIMIT 5
        `
      ]);

      res.json({
        totalMembers: memberCount,
        totalGroups: groupCount,
        recentDonations,
        upcomingBirthdays
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
  });
}; 