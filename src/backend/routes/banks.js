const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the auth middleware properly
const {authenticateToken} = require('../middleware/auth');

// Get all banks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const banks = await prisma.bank.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(banks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a specific bank
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const bank = await prisma.bank.findUnique({
      where: {
        id: req.params.id
      }
    });
    
    if (!bank) {
      return res.status(404).json({ msg: 'Bank not found' });
    }
    
    res.json(bank);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a bank
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      routing_number,
      account_number,
      contact,
      phone
    } = req.body;

    const bank = await prisma.bank.create({
      data: {
        name,
        address,
        city,
        state,
        zipCode: zipCode,
        routingNumber: routing_number,
        accountNumber: account_number,
        contact: contact,
        phone
      }
    });

    res.json(bank);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a bank
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      state,
      zipCode,
      routing_number,
      account_number,
      contact,
      phone
    } = req.body;

    console.log(req.body);
    // First check if bank exists
    const bankExists = await prisma.bank.findUnique({
      where: {
        id: req.params.id
      }
    });

    if (!bankExists) {
      return res.status(404).json({ msg: 'Bank not found' });
    }

    const bank = await prisma.bank.update({
      where: {
        id: req.params.id
      },
      data: {
        name: name !== undefined ? name : undefined,
        address: address !== undefined ? address : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        zipCode: zipCode !== undefined ? zipCode : undefined,
        routingNumber: routing_number !== undefined ? routing_number : undefined,
        accountNumber: account_number !== undefined ? account_number : undefined,
        contact: contact !== undefined ? contact : undefined,
        phone: phone !== undefined ? phone : undefined
      }
    });

    res.json(bank);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a bank
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // First check if bank exists
    const bank = await prisma.bank.findUnique({
      where: {
        id: req.params.id
      },
      include: {
        deposits: true
      }
    });

    if (!bank) {
      return res.status(404).json({ msg: 'Bank not found' });
    }

    // Check if bank has related deposits
    if (bank.deposits.length > 0) {
      return res.status(400).json({ 
        msg: 'Cannot delete bank with associated deposits. Please delete the deposits first.'
      });
    }

    await prisma.bank.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ msg: 'Bank removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router; 