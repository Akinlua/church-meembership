const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the auth middleware properly
const {authenticateToken} = require('../middleware/auth');

// Get all deposits
router.get('/', authenticateToken, async (req, res) => {
  try {
    const deposits = await prisma.deposit.findMany({
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          }
        },
        checks: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json(deposits);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific deposit
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const deposit = await prisma.deposit.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true,
          }
        },
        checks: true
      }
    });
    
    if (!deposit) {
      return res.status(404).json({ msg: 'Deposit not found' });
    }
    
    res.json(deposit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a deposit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      bank_id,
      account_number,
      date,
      cash_amount,
      checks,
      total_amount,
      notes
    } = req.body;

    // Verify bank exists
    const bank = await prisma.bank.findUnique({
      where: {
        id: bank_id
      }
    });
    
    if (!bank) {
      return res.status(404).json({ msg: 'Bank not found' });
    }

    // Create the deposit with checks
    const deposit = await prisma.deposit.create({
      data: {
        bankId: bank_id,
        accountNumber: account_number,
        date: date ? new Date(date) : new Date(),
        cashAmount: parseFloat(cash_amount) || 0,
        totalAmount: parseFloat(total_amount) || 0,
        checks: {
          create: checks && checks.length > 0 ? checks.map(check => ({
            amount: parseFloat(check.amount) || 0
          })) : []
        }
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true
          }
        },
        checks: true
      }
    });

    res.json(deposit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a deposit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      bank_id,
      account_number,
      date,
      cash_amount,
      checks,
      total_amount,
      notes
    } = req.body;

    // Verify deposit exists
    const depositExists = await prisma.deposit.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!depositExists) {
      return res.status(404).json({ msg: 'Deposit not found' });
    }

    // If bank_id was provided, verify bank exists
    if (bank_id) {
      const bank = await prisma.bank.findUnique({
        where: {
          id: bank_id
        }
      });
      
      if (!bank) {
        return res.status(404).json({ msg: 'Bank not found' });
      }
    }

    // First delete the existing checks
    if (checks) {
      await prisma.check.deleteMany({
        where: {
          depositId: req.params.id
        }
      });
    }

    // Update the deposit
    const deposit = await prisma.deposit.update({
      where: {
        id: req.params.id
      },
      data: {
        bankId: bank_id !== undefined ? bank_id : undefined,
        accountNumber: account_number !== undefined ? account_number : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        cashAmount: cash_amount !== undefined ? parseFloat(cash_amount) : undefined,
        totalAmount: total_amount !== undefined ? parseFloat(total_amount) : undefined,
        checks: checks ? {
          create: checks.map(check => ({
            amount: parseFloat(check.amount) || 0
          }))
        } : undefined
      },
      include: {
        bank: {
          select: {
            id: true,
            name: true
          }
        },
        checks: true
      }
    });

    res.json(deposit);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a deposit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify deposit exists
    const deposit = await prisma.deposit.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!deposit) {
      return res.status(404).json({ msg: 'Deposit not found' });
    }

    await prisma.deposit.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ msg: 'Deposit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 