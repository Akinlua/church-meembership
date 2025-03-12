const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const PDFDocument = require('pdfkit');

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Donation Report Route
  app.get('/reports/donations', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, memberId } = req.query;
      
      let whereClause = {};
      
      if (startDate && endDate) {
        whereClause.donationDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.donationDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.donationDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      if (memberId) {
        whereClause.memberId = parseInt(memberId); // Filter by member ID
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

  // Total Donation Report Route
  app.get('/reports/donations/total', authenticateToken, async (req, res) => {
    try {
      const donations = await prisma.donation.findMany({
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);

      res.json({
        totalAmount,
        donations
      });
    } catch (error) {
      console.error('Error generating total donation report:', error);
      res.status(500).json({ message: 'Error generating total donation report' });
    }
  });

  // Donation Type Summary Report Route
  app.get('/reports/donations/type-summary', authenticateToken, async (req, res) => {
    try {
      const donations = await prisma.donation.findMany({
        include: {
          member: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      const summary = donations.reduce((acc, donation) => {
        acc[donation.donationType] = (acc[donation.donationType] || 0) + parseFloat(donation.amount);
        return acc;
      }, {});

      res.json({
        summary
      });
    } catch (error) {
      console.error('Error generating donation type summary report:', error);
      res.status(500).json({ message: 'Error generating donation type summary report' });
    }
  });

  // Donation Type Summary PDF Route
  app.post('/reports/donations/type-summary/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, memberId } = req.body;

      let whereClause = {};
      
      if (startDate && endDate) {
        whereClause.donationDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.donationDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.donationDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      if (memberId) {
        whereClause.memberId = parseInt(memberId); // Filter by member ID
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

      console.log(donations)

      // Create a summary that only includes donations within the specified date range
      const summary = donations.reduce((acc, donation) => {
        if (!acc[donation.donationType]) {
          acc[donation.donationType] = 0;
        }
        acc[donation.donationType] += parseFloat(donation.amount);
        return acc;
      }, {});

      const totalAmount = Object.values(summary).reduce((sum, amount) => sum + amount, 0);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=donation-type-summary-report.pdf');

      doc.pipe(res);

      doc.moveDown(0.5)
          .fontSize(18)
          .font('Helvetica')
          .text('Donation Type Summary', { align: 'center' });

      // Updated date range display
      if (startDate || endDate) {
        doc.moveDown(0.5)
            .fontSize(12)
            .font('Helvetica-Bold')
            .text(`From    ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'}    To    ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
      }

      doc.moveDown(2);

      // Draw table
      const tableTop = 130;
      const columnSpacing = 20;
      const columns = {
        type: { x: 50, width: 200 },
        amount: { x: 300, width: 100 }
      };

      // Draw header
      doc.font('Helvetica-Bold')
         .fontSize(10);

      // Header background
      doc.rect(50, tableTop - 5, 490, 20)
         .fill('#f3f4f6');

      // Header text
      doc.fillColor('#000000')
        .text('Type Name', columns.type.x, tableTop)
        .text('Amount', columns.amount.x, tableTop);

      // Draw rows
      let yPosition = tableTop + 25;
      doc.font('Helvetica').fontSize(10);

      // Add summary data
      Object.entries(summary).forEach(([type, amount], i) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          
          // Repeat header on new page
          doc.rect(50, yPosition - 5, 490, 20)
              .fill('#f3f4f6');
          
          doc.fillColor('#000000')
              .font('Helvetica-Bold')
              .text('Type Name', columns.type.x, yPosition)
              .text('Amount', columns.amount.x, yPosition);
          
          yPosition += 25;
          doc.font('Helvetica');
        }
  
        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 20)
              .fill('#f9fafb');
        }
  
        doc.fillColor('#000000')
            .text(type, columns.type.x, yPosition)
            .text(formatCurrency(amount), columns.amount.x, yPosition);
  
        yPosition += 20;
      });

      // Add summary section
      doc.moveDown(5)
         .font('Helvetica-Bold')
         .fontSize(12);

      // Calculate the total text
      const totalText = `Total: ${formatCurrency(totalAmount)}`;
      const textWidth = doc.widthOfString(totalText);

      // Center the text by calculating the x position
      const x_Position = (doc.page.width - textWidth) / 2;

      // Set the y position right below the table
      const y_Position = yPosition + 20; // Add some space below the table

      // Add the total text at the calculated position
      doc.text(totalText, x_Position, y_Position);

      doc.end();
    } catch (error) {
      console.error('Error generating donation type summary PDF:', error);
      res.status(500).json({ message: 'Error generating donation type summary PDF' });
    }
  });

  router.post('/donations/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, memberId } = req.body;
      
      // Create date filter
      let whereClause = {};
      if (startDate || endDate) {
        whereClause.donationDate = {};
        if (startDate) {
          whereClause.donationDate.gte = new Date(startDate);
        }
        if (endDate) {
          whereClause.donationDate.lte = new Date(new Date(endDate).setHours(23, 59, 59));
        }
      }

      if (memberId) {
        whereClause.memberId = parseInt(memberId); // Filter by member ID
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

      // Calculate totals by type
      const totalsByType = donations.reduce((acc, donation) => {
        acc[donation.donationType] = (acc[donation.donationType] || 0) + parseFloat(donation.amount);
        return acc;
      }, {});

      const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=donations-report.pdf');

      doc.pipe(res);
      
      doc.moveDown(0.5)
         .fontSize(18)
         .font('Helvetica')
         .text('Donation Totals', { align: 'center' });

      if (startDate || endDate) {
        // Updated date range display
        doc.moveDown(0.5)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`From    ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'}    To    ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });

      }

      doc.moveDown(2);

      // Draw table
      const tableTop = 130;
      const columnSpacing = 20;
      const columns = {
        date: { x: 50, width: 100 },
        member: { x: 170, width: 150 },
        amount: { x: 340, width: 100 },
        type: { x: 460, width: 80 }
      };

      // Draw header
      doc.font('Helvetica-Bold')
         .fontSize(10);

      // Header background
      doc.rect(50, tableTop - 5, 490, 20)
         .fill('#f3f4f6');

      // Header text
      doc.fillColor('#000000')
         .text('Date', columns.date.x, tableTop)
         .text('Member', columns.member.x, tableTop)
         .text('Amount', columns.amount.x, tableTop)
         .text('Type', columns.type.x, tableTop);

      // Draw rows
      let yPosition = tableTop + 25;
      doc.font('Helvetica').fontSize(10);

      donations.forEach((donation, i) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
          
          // Repeat header on new page
          doc.rect(50, yPosition - 5, 490, 20)
             .fill('#f3f4f6');
          
          doc.fillColor('#000000')
             .font('Helvetica-Bold')
             .text('Date', columns.date.x, yPosition)
             .text('Member', columns.member.x, yPosition)
             .text('Amount', columns.amount.x, yPosition)
             .text('Type', columns.type.x, yPosition);

          
          yPosition += 25;
          doc.font('Helvetica');
        }

        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 20)
             .fill('#f9fafb');
        }

        doc.fillColor('#000000')
           .text(new Date(donation.donationDate).toLocaleDateString(), columns.date.x, yPosition)
           .text(`${donation.member.firstName} ${donation.member.lastName}`, columns.member.x, yPosition)
           .text(formatCurrency(donation.amount), columns.amount.x, yPosition)
           .text(donation.donationType, columns.type.x, yPosition);

        yPosition += 20;
      });

      // Add summary section
      doc.moveDown(5)
         .font('Helvetica-Bold')
         .fontSize(12);

      // Calculate the total text
      const totalText = `Total: ${formatCurrency(totalAmount)}`;
      const textWidth = doc.widthOfString(totalText);

      // Center the text by calculating the x position
      const x_Position = (doc.page.width - textWidth) / 2;

      // Set the y position right below the table
      const y_Position = yPosition + 20; // Add some space below the table

      // Add the total text at the calculated position
      doc.text(totalText, x_Position, y_Position);

      doc.end();
    } catch (error) {
      console.error('Error generating PDF:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error generating PDF report', error: error.message });
      }
    }
  });

  return router;
}; 