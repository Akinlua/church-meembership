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
  app.get('/reports/membership', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, memberStatus } = req.query;

      let whereClause = {};

      // Date filtering
      if (startDate && endDate) {
        whereClause.membershipDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.membershipDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.membershipDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      // Member status filtering
      if (memberStatus === 'active') {
        whereClause.isActive = true;
      } else if (memberStatus === 'inactive') {
        whereClause.isActive = false;
      }
      // If memberStatus is 'all' or undefined, don't filter by status

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
        total: formattedMembers.length
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
  app.get('/reports/totalDonations', authenticateToken, async (req, res) => {
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
  app.get('/reports/donationTypeSummary', authenticateToken, async (req, res) => {
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
  app.post('/reports/donationTypeSummary/pdf', authenticateToken, async (req, res) => {
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
      doc.rect(50, tableTop - 5, 490, 16)
        .fill('#f3f4f6');

      // Header text
      doc.fillColor('#000000')
        .text('Type Name', columns.type.x, tableTop)
        .text('Amount', columns.amount.x, tableTop);

      // Draw rows
      let yPosition = tableTop + 20;
      doc.font('Helvetica').fontSize(10);

      // Add summary data
      Object.entries(summary).forEach(([type, amount], i) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;

          // Repeat header on new page
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f3f4f6');

          doc.fillColor('#000000')
            .font('Helvetica-Bold')
            .text('Type Name', columns.type.x, yPosition)
            .text('Amount', columns.amount.x, yPosition);

          yPosition += 16;
          doc.font('Helvetica');
        }

        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f9fafb');
        }

        doc.fillColor('#000000')
          .text(type, columns.type.x, yPosition)
          .text(formatCurrency(amount), columns.amount.x, yPosition);

        yPosition += 16;
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
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f3f4f6');

          doc.fillColor('#000000')
            .font('Helvetica-Bold')
            .text('Date', columns.date.x, yPosition)
            .text('Member', columns.member.x, yPosition)
            .text('Amount', columns.amount.x, yPosition)
            .text('Type', columns.type.x, yPosition);


          yPosition += 16;
          doc.font('Helvetica');
        }

        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f9fafb');
        }

        doc.fillColor('#000000')
          .text(new Date(donation.donationDate).toLocaleDateString(), columns.date.x, yPosition)
          .text(`${donation.member.firstName} ${donation.member.lastName}`, columns.member.x, yPosition)
          .text(formatCurrency(donation.amount), columns.amount.x, yPosition)
          .text(donation.donationType, columns.type.x, yPosition);

        yPosition += 16;
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

  // Vendors Report Route
  app.get('/reports/vendors', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, vendorId } = req.query;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.createdAt = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.createdAt = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      // Add vendor ID filter if provided
      if (vendorId) {
        whereClause.id = parseInt(vendorId);
      }

      const vendors = await prisma.vendor.findMany({
        where: whereClause,
        orderBy: {
          lastName: 'asc'
        }
      });

      // Get total charges for each vendor
      const vendorsWithCharges = await Promise.all(
        vendors.map(async (vendor) => {
          const charges = await prisma.charge.findMany({
            where: {
              vendorId: vendor.id
            }
          });

          const totalCharges = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

          return {
            ...vendor,
            totalCharges
          };
        })
      );

      res.json({
        vendors: vendorsWithCharges,
        total: vendorsWithCharges.length
      });
    } catch (error) {
      console.error('Error generating vendors report:', error);
      res.status(500).json({ message: 'Error generating vendors report' });
    }
  });

  // Vendors PDF Report
  app.post('/reports/vendors/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, vendorId } = req.body;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.createdAt = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.createdAt = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.createdAt = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      // Add vendor ID filter if provided
      if (vendorId) {
        whereClause.id = parseInt(vendorId);
      }

      const vendors = await prisma.vendor.findMany({
        where: whereClause,
        orderBy: {
          lastName: 'asc'
        }
      });

      // Get total charges for each vendor
      const vendorsWithCharges = await Promise.all(
        vendors.map(async (vendor) => {
          const charges = await prisma.charge.findMany({
            where: {
              vendorId: vendor.id
            }
          });

          const totalCharges = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

          return {
            ...vendor,
            totalCharges
          };
        })
      );

      const totalAmount = vendorsWithCharges.reduce((sum, v) => sum + v.totalCharges, 0);

      // Create PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=vendors-report.pdf');

      // Pipe PDF to response
      doc.pipe(res);

      doc.moveDown(0.5)
        .fontSize(18)
        .font('Helvetica')
        .text('Vendors Report', { align: 'center' });

      if (startDate || endDate) {
        doc.moveDown(0.5)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(`From    ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'}    To    ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
      }

      if (vendorId) {
        const vendor = vendorsWithCharges.find(v => v.id === parseInt(vendorId));
        if (vendor) {
          doc.moveDown(0.5)
            .fontSize(12)
            .font('Helvetica')
            .text(`Filtered by Vendor: ${vendor.lastName}`, { align: 'center' });
        }
      }

      doc.moveDown(2);

      // Draw table
      const tableTop = 150;
      const columns = {
        name: { x: 50, width: 200 },
        contact: { x: 270, width: 180 },
        amount: { x: 470, width: 100 }
      };

      // Draw header
      doc.font('Helvetica-Bold')
        .fontSize(10);

      // Header background
      doc.rect(50, tableTop - 5, 490, 20)
        .fill('#f3f4f6');

      // Header text
      doc.fillColor('#000000')
        .text('Vendor Name', columns.name.x, tableTop)
        .text('Contact', columns.contact.x, tableTop)
        .text('Total Charges', columns.amount.x, tableTop);

      // Draw rows
      let yPosition = tableTop + 25;
      doc.font('Helvetica').fontSize(10);

      vendorsWithCharges.forEach((vendor, i) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;

          // Repeat header on new page
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f3f4f6');

          doc.fillColor('#000000')
            .font('Helvetica-Bold')
            .text('Vendor Name', columns.name.x, yPosition)
            .text('Contact', columns.contact.x, yPosition)
            .text('Total Charges', columns.amount.x, yPosition);

          yPosition += 16;
          doc.font('Helvetica');
        }

        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f9fafb');
        }

        doc.fillColor('#000000')
          .text(vendor.lastName, columns.name.x, yPosition)
          .text(vendor.email || 'N/A', columns.contact.x, yPosition)
          .text(formatCurrency(vendor.totalCharges || 0), columns.amount.x, yPosition);

        yPosition += 16;
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
      const y_Position = yPosition + 20;

      // Add the total text at the calculated position
      doc.text(totalText, x_Position, y_Position);

      // Finalize PDF
      doc.end();
    } catch (error) {
      console.error('Error generating vendors PDF report:', error);
      res.status(500).json({ message: 'Error generating vendors PDF report' });
    }
  });

  // Expenses Report Route
  app.get('/reports/expenses', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.dueDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.dueDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.dueDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const expenses = await prisma.charge.findMany({
        where: whereClause,
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          dueDate: 'desc'
        }
      });

      const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      res.json({
        expenses,
        total
      });
    } catch (error) {
      console.error('Error generating expenses report:', error);
      res.status(500).json({ message: 'Error generating expenses report' });
    }
  });

  // Expenses PDF Report
  app.post('/reports/expenses/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.dueDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.dueDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.dueDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const expenses = await prisma.charge.findMany({
        where: whereClause,
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          dueDate: 'desc'
        }
      });

      const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=expenses-report.pdf');

      doc.pipe(res);

      doc.fontSize(20).text('Expenses Report', { align: 'center' });
      doc.moveDown();

      if (startDate || endDate) {
        doc.fontSize(12)
          .text(`Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
        doc.moveDown();
      }

      // Table headers
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Due Date', 50, 150);
      doc.text('Vendor', 150, 150);
      doc.text('Category', 250, 150);
      doc.text('Amount', 350, 150);
      doc.moveDown();

      let y = 180;
      doc.font('Helvetica');

      expenses.forEach(expense => {
        if (y > 700) {
          doc.addPage();
          y = 50;
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Due Date', 50, y);
          doc.text('Vendor', 150, y);
          doc.text('Category', 250, y);
          doc.text('Amount', 350, y);
          y += 24;
          doc.font('Helvetica');
        }

        doc.text(new Date(expense.dueDate).toLocaleDateString(), 50, y);
        doc.text(`${expense.vendor.lastName}`, 150, y);
        doc.text(expense.expenseCategory?.name || 'N/A', 250, y);
        doc.text(formatCurrency(expense.amount), 350, y);
        y += 16;
      });

      // Total
      doc.moveDown();
      doc.font('Helvetica-Bold');
      doc.text(`Total: ${formatCurrency(total)}`, 350);

      doc.end();
    } catch (error) {
      console.error('Error generating expenses PDF report:', error);
      res.status(500).json({ message: 'Error generating expenses PDF report' });
    }
  });

  // Charges Report Route
  app.get('/reports/charges', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.dueDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.dueDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.dueDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const charges = await prisma.charge.findMany({
        where: whereClause,
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          dueDate: 'desc'
        }
      });

      const total = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

      // Group charges by category
      const categorySummary = charges.reduce((acc, charge) => {
        const categoryName = charge.expenseCategory?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += parseFloat(charge.amount);
        return acc;
      }, {});

      res.json({
        charges,
        total,
        categorySummary
      });
    } catch (error) {
      console.error('Error generating charges report:', error);
      res.status(500).json({ message: 'Error generating charges report' });
    }
  });

  // Charges PDF Report
  app.post('/reports/charges/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.dueDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.dueDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.dueDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const charges = await prisma.charge.findMany({
        where: whereClause,
        include: {
          vendor: true,
          expenseCategory: true
        },
        orderBy: {
          dueDate: 'desc'
        }
      });

      const total = charges.reduce((sum, charge) => sum + parseFloat(charge.amount), 0);

      // Group charges by category
      const categorySummary = charges.reduce((acc, charge) => {
        const categoryName = charge.expenseCategory?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName] += parseFloat(charge.amount);
        return acc;
      }, {});

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=charges-report.pdf');

      doc.pipe(res);

      doc.fontSize(20).text('Charges Report', { align: 'center' });
      doc.moveDown();

      if (startDate || endDate) {
        doc.fontSize(12)
          .text(`Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
        doc.moveDown();
      }

      // Table headers
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Due Date', 50, 150);
      doc.text('Vendor', 150, 150);
      doc.text('Category', 250, 150);
      doc.text('Amount', 350, 150);
      doc.moveDown();

      let y = 180;
      doc.font('Helvetica');

      charges.forEach(charge => {
        if (y > 700) {
          doc.addPage();
          y = 50;
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Due Date', 50, y);
          doc.text('Vendor', 150, y);
          doc.text('Category', 250, y);
          doc.text('Amount', 350, y);
          y += 24;
          doc.font('Helvetica');
        }

        doc.text(new Date(charge.dueDate).toLocaleDateString(), 50, y);
        doc.text(`${charge.vendor.lastName}`, 150, y);
        doc.text(charge.expenseCategory?.name || 'N/A', 250, y);
        doc.text(formatCurrency(charge.amount), 350, y);
        y += 16;
      });

      // Total
      doc.moveDown();
      doc.font('Helvetica-Bold');
      doc.text(`Total: ${formatCurrency(total)}`, 350);

      // Category Summary
      doc.addPage();
      doc.fontSize(16).text('Category Summary', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Category', 100, 100);
      doc.text('Amount', 300, 100);
      doc.moveDown();

      y = 130;
      doc.font('Helvetica');

      Object.entries(categorySummary).forEach(([category, amount]) => {
        doc.text(category, 100, y);
        doc.text(formatCurrency(amount), 300, y);
        y += 16;
      });

      doc.end();
    } catch (error) {
      console.error('Error generating charges PDF report:', error);
      res.status(500).json({ message: 'Error generating charges PDF report' });
    }
  });

  // Deposits Report Route
  app.get('/reports/deposits', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.date = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.date = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.date = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const deposits = await prisma.deposit.findMany({
        where: whereClause,
        include: {
          bank: true,
          checks: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      const total = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.totalAmount || 0), 0);

      res.json({
        deposits,
        total
      });
    } catch (error) {
      console.error('Error generating deposits report:', error);
      res.status(500).json({ message: 'Error generating deposits report' });
    }
  });

  // Deposits PDF Report
  app.post('/reports/deposits/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      let whereClause = {};

      if (startDate && endDate) {
        whereClause.date = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.date = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.date = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      const deposits = await prisma.deposit.findMany({
        where: whereClause,
        include: {
          bank: true,
          checks: true
        },
        orderBy: {
          date: 'desc'
        }
      });

      const total = deposits.reduce((sum, deposit) => sum + parseFloat(deposit.totalAmount || 0), 0);

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=deposits-report.pdf');

      doc.pipe(res);

      doc.fontSize(20).text('Deposits Report', { align: 'center' });
      doc.moveDown();

      if (startDate || endDate) {
        doc.fontSize(12)
          .text(`Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
        doc.moveDown();
      }

      // Table headers
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Date', 50, 150);
      doc.text('Bank', 150, 150);
      doc.text('Account #', 250, 150);
      doc.text('Cash', 350, 150);
      doc.text('Check', 430, 150);
      doc.text('Total', 510, 150);
      doc.moveDown();

      let y = 180;
      doc.font('Helvetica');

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2
        }).format(parseFloat(amount || 0));
      };

      // Calculate the total check amount from the checks array
      const getCheckAmount = (deposit) => {
        if (!deposit.checks || deposit.checks.length === 0) {
          return 0;
        }
        return deposit.checks.reduce((sum, check) => sum + parseFloat(check.amount || 0), 0);
      };

      deposits.forEach(deposit => {
        if (y > 700) {
          doc.addPage();
          y = 50;
          doc.fontSize(12).font('Helvetica-Bold');
          doc.text('Date', 50, y);
          doc.text('Bank', 150, y);
          doc.text('Account #', 250, y);
          doc.text('Cash', 350, y);
          doc.text('Check', 430, y);
          doc.text('Total', 510, y);
          y += 24;
          doc.font('Helvetica');
        }

        doc.text(new Date(deposit.date).toLocaleDateString(), 50, y);
        doc.text(deposit.bank?.name || 'N/A', 150, y);
        doc.text(deposit.accountNumber || 'N/A', 250, y);
        doc.text(formatCurrency(deposit.cashAmount), 350, y);
        doc.text(formatCurrency(getCheckAmount(deposit)), 430, y);
        doc.text(formatCurrency(deposit.totalAmount), 510, y);
        y += 16;
      });

      // Total
      doc.moveDown();
      doc.font('Helvetica-Bold');
      doc.text(`Total: ${formatCurrency(total)}`, 400);

      doc.end();
    } catch (error) {
      console.error('Error generating deposits PDF report:', error);
      res.status(500).json({ message: 'Error generating deposits PDF report' });
    }
  });

  // Membership PDF Report
  app.post('/reports/membership/pdf', authenticateToken, async (req, res) => {
    try {
      const { startDate, endDate, memberStatus } = req.body;

      let whereClause = {};

      // Date filtering
      if (startDate && endDate) {
        whereClause.membershipDate = {
          gte: new Date(startDate),
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      } else if (startDate) {
        whereClause.membershipDate = {
          gte: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.membershipDate = {
          lte: new Date(new Date(endDate).setHours(23, 59, 59))
        };
      }

      // Member status filtering
      if (memberStatus === 'active') {
        whereClause.isActive = true;
      } else if (memberStatus === 'inactive') {
        whereClause.isActive = false;
      }
      // If memberStatus is 'all' or undefined, don't filter by status

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

      // Create PDF document with landscape orientation for more space
      const doc = new PDFDocument({
        margin: 30,
        size: 'A4',
        layout: 'landscape'
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=membership-report.pdf');

      // Pipe PDF to response
      doc.pipe(res);

      // Add title
      doc.fontSize(20).text('Membership Report', { align: 'center' });
      doc.moveDown();

      // Add date range if provided
      if (startDate || endDate) {
        doc.fontSize(12).text(`Date Range: ${startDate ? new Date(startDate).toLocaleDateString() : 'Start'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, { align: 'center' });
        doc.moveDown();
      }

      // Add member status filter info
      if (memberStatus === 'active') {
        doc.fontSize(12).text('Active Members Only', { align: 'center' });
      } else if (memberStatus === 'inactive') {
        doc.fontSize(12).text('Inactive Members Only', { align: 'center' });
      } else {
        doc.fontSize(12).text('All Members', { align: 'center' });
      }
      doc.moveDown();

      // Add total count
      doc.fontSize(14).text(`Total Members: ${formattedMembers.length}`, { align: 'left' });
      doc.moveDown(2);

      // Define column widths with more space for address
      const columnWidths = {
        name: 120,
        phone: 100,
        address: 200,  // Increased width for address
        email: 140,
        date: 80,
        groups: 140
      };

      // Create table headers
      const tableTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');

      let xPos = 30;
      doc.text('Name', xPos, tableTop);
      xPos += columnWidths.name;

      doc.text('Phone', xPos, tableTop);
      xPos += columnWidths.phone;

      doc.text('Address', xPos, tableTop);
      xPos += columnWidths.address;

      doc.text('Email', xPos, tableTop);
      xPos += columnWidths.email;

      doc.text('Member Date', xPos, tableTop);
      xPos += columnWidths.date;

      doc.text('Groups', xPos, tableTop);

      // Draw a line
      doc.moveDown();
      doc.moveTo(30, doc.y).lineTo(doc.page.width - 30, doc.y).stroke();
      doc.moveDown(0.5);

      // Table rows
      let y = doc.y;
      doc.font('Helvetica').fontSize(9);

      formattedMembers.forEach((member) => {
        // Check if we need a new page
        if (y > doc.page.height - 50) {
          doc.addPage({ layout: 'landscape' });
          y = 50;

          // Redraw headers on new page
          doc.fontSize(10).font('Helvetica-Bold');

          xPos = 30;
          doc.text('Name', xPos, y);
          xPos += columnWidths.name;

          doc.text('Phone', xPos, y);
          xPos += columnWidths.phone;

          doc.text('Address', xPos, y);
          xPos += columnWidths.address;

          doc.text('Email', xPos, y);
          xPos += columnWidths.email;

          doc.text('Member Date', xPos, y);
          xPos += columnWidths.date;

          doc.text('Groups', xPos, y);

          // Draw a line
          y += 12;
          doc.moveTo(30, y).lineTo(doc.page.width - 30, y).stroke();
          y += 12;
          doc.font('Helvetica').fontSize(9);
        }

        const name = `${member.lastName}, ${member.firstName}`;
        const address = [member.address, member.city, member.state, member.zipCode]
          .filter(Boolean)
          .join(', ');
        const groups = member.groups.join(', ') || 'None';
        const memberDate = member.membershipDate ? new Date(member.membershipDate).toLocaleDateString() : 'N/A';

        xPos = 30;
        doc.text(name, xPos, y, { width: columnWidths.name - 5 });
        xPos += columnWidths.name;

        doc.text(member.cellPhone || 'N/A', xPos, y);
        xPos += columnWidths.phone;

        doc.text(address || 'N/A', xPos, y, { width: columnWidths.address - 5 });
        xPos += columnWidths.address;

        doc.text(member.email || 'N/A', xPos, y, { width: columnWidths.email - 5 });
        xPos += columnWidths.email;

        doc.text(memberDate, xPos, y);
        xPos += columnWidths.date;

        doc.text(groups, xPos, y, { width: columnWidths.groups - 5 });

        y += 16;
      });

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Error generating membership PDF report:', error);
      res.status(500).json({ message: 'Error generating membership PDF report' });
    }
  });

  // Groups PDF Report
  app.post('/reports/groups/pdf', authenticateToken, async (req, res) => {
    try {
      const groups = await prisma.group.findMany({
        include: {
          _count: {
            select: { members: true }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      // Create PDF document
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=groups-report.pdf');

      // Pipe PDF to response
      doc.pipe(res);

      doc.moveDown(0.5)
        .fontSize(18)
        .font('Helvetica')
        .text('Groups Report', { align: 'center' });

      doc.moveDown(2);

      // Draw table
      const tableTop = 150;
      const columns = {
        name: { x: 50, width: 150 },
        description: { x: 220, width: 230 },
        count: { x: 470, width: 100 }
      };

      // Draw header
      doc.font('Helvetica-Bold')
        .fontSize(10);

      // Header background
      doc.rect(50, tableTop - 5, 490, 20)
        .fill('#f3f4f6');

      // Header text
      doc.fillColor('#000000')
        .text('Group Name', columns.name.x, tableTop)
        .text('Description', columns.description.x, tableTop)
        .text('Member Count', columns.count.x, tableTop);

      // Draw rows
      let yPosition = tableTop + 25;
      doc.font('Helvetica').fontSize(10);

      groups.forEach((group, i) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;

          // Repeat header on new page
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f3f4f6');

          doc.fillColor('#000000')
            .font('Helvetica-Bold')
            .text('Group Name', columns.name.x, yPosition)
            .text('Description', columns.description.x, yPosition)
            .text('Member Count', columns.count.x, yPosition);

          yPosition += 16;
          doc.font('Helvetica');
        }

        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(50, yPosition - 5, 490, 16)
            .fill('#f9fafb');
        }

        doc.fillColor('#000000')
          .text(group.name, columns.name.x, yPosition)
          .text(group.description || 'No description', columns.description.x, yPosition)
          .text(group._count.members.toString(), columns.count.x, yPosition);

        yPosition += 16;
      });

      // Add summary section
      doc.moveDown(5)
        .font('Helvetica-Bold')
        .fontSize(12);

      // Calculate the total text
      const totalText = `Total Groups: ${groups.length}`;
      const textWidth = doc.widthOfString(totalText);

      // Center the text by calculating the x position
      const x_Position = (doc.page.width - textWidth) / 2;

      // Set the y position right below the table
      const y_Position = yPosition + 20;

      // Add the total text at the calculated position
      doc.text(totalText, x_Position, y_Position);

      // Finalize PDF
      doc.end();

    } catch (error) {
      console.error('Error generating groups PDF report:', error);
      res.status(500).json({ message: 'Error generating groups PDF report' });
    }
  });

  return router;
}; 
