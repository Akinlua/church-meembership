const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Donation Report Route
  app.get('/reports/donations', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let whereClause = {};
      
      if (startDate && endDate) {
        whereClause.donationDate = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const donations = await prisma.donation.findMany({
        where: whereClause,
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          donationDate: 'desc'
        }
      });

      const total = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);

      res.json({
        donations,
        total
      });
    } catch (error) {
      console.error('Error generating donation report:', error);
      res.status(500).json({ message: 'Error generating donation report' });
    }
  });

  // Membership Report Route
  app.get('/reports/members', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      let whereClause = {};
      
      if (startDate && endDate) {
        whereClause.membership_date = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      const members = await prisma.member.findMany({
        where: whereClause,
        include: {
          groups: {
            include: {
              group: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          lastName: 'asc'
        }
      });

      // Transform the data to include group names
      const formattedMembers = members.map(member => ({
        ...member,
        groups: member.groups.map(membership => membership.group.name)
      }));

      res.json({
        members: formattedMembers,
        total: members.length
      });
    } catch (error) {
      console.error('Error generating membership report:', error);
      res.status(500).json({ message: 'Error generating membership report' });
    }
  });

  // Group Report Route
  app.get('/reports/groups', authenticateToken, async (req, res) => {
    try {
      const groups = await prisma.group.findMany({
        include: {
          members: {
            include: {
              member: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Transform the data to a more usable format
      const formattedGroups = groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        members: group.members.map(membership => ({
          firstName: membership.member.firstName,
          lastName: membership.member.lastName
        }))
      }));

      res.json({
        groups: formattedGroups,
        total: groups.length
      });
    } catch (error) {
      console.error('Error generating group report:', error);
      res.status(500).json({ message: 'Error generating group report' });
    }
  });

  app.post('/reports/donations/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      const donations = await prisma.donation.findMany({
        where: {
          donationDate: {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined
          }
        },
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          donationDate: 'desc'
        }
      });

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=donation-report.pdf`);
      doc.pipe(res);

      // Add report header
      doc.fontSize(20).text('Donation Report', { align: 'center' });
      doc.moveDown();
      
      if (startDate && endDate) {
        doc.fontSize(12).text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
        doc.moveDown();
      }

      // Add table headers
      const tableTop = 150;
      doc.fontSize(10);
      doc.text('Date', 50, tableTop);
      doc.text('Member', 150, tableTop);
      doc.text('Type', 250, tableTop);
      doc.text('Amount', 400, tableTop, { align: 'right' });

      // Add table rows
      let y = tableTop + 20;
      let total = 0;

      donations.forEach(donation => {
        doc.text(new Date(donation.donationDate).toLocaleDateString(), 50, y);
        doc.text(`${donation.member.firstName} ${donation.member.lastName}`, 150, y);
        doc.text(donation.donationType, 250, y);
        doc.text(formatCurrency(donation.amount), 400, y, { align: 'right' });
        y += 20;
        total += parseFloat(donation.amount);
      });

      // Add total
      doc.moveDown();
      doc.fontSize(12).text(`Total: ${formatCurrency(total)}`, { align: 'right' });

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ message: 'Error generating PDF report' });
    }
  });

  return router;
}; 