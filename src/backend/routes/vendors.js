const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'vendors',
    format: async (req, file) => 'png',
    public_id: (req, file) => `vendor-${Date.now()}`
  }
});

const upload = multer({ storage: storage });

module.exports = function(app) {
  // Get all vendors
  const prisma = app.get('prisma');

  app.get('/vendors', authenticateToken, async (req, res) => {
    try {
      const vendors = await prisma.vendor.findMany({
        orderBy: { lastName: 'asc' }
      });
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ message: 'Error fetching vendors' });
    }
  });

  // Get specific vendor
  app.get('/vendors/:id', authenticateToken, async (req, res) => {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      
      if (!vendor) {
        return res.status(404).json({ message: 'Vendor not found' });
      }
      
      res.json(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ message: 'Error fetching vendor' });
    }
  });

  // Create new vendor
  app.post('/vendors', authenticateToken, 
    upload.single('profile_image'), 
    async (req, res) => {
      console.log(req.body)
    try {
      const {
        last_name,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        account_number
      } = req.body;

      // Generate vendor number (you can customize the logic as needed)
      const lastVendor = await prisma.vendor.findFirst({
        orderBy: { id: 'desc' }
      });
      
      const vendorNumber = lastVendor ? (parseInt(lastVendor.vendorNumber || '0') + 1).toString() : '1';
      
      const vendor = await prisma.vendor.create({
        data: {
          lastName: last_name,
          address,
          city,
          state,
          zipCode: zip_code,
          phone,
          email,
          accountNumber: account_number,
          vendorNumber,
          // profileImage: req.file ? req.file.path : null
        }
      });
      
      res.status(201).json(vendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ message: 'Error creating vendor' });
    }
  });

  // Update vendor
  app.put('/vendors/:id', authenticateToken,
     upload.single('profile_image'), 
     async (req, res) => {
    try {
      const {
        last_name,
        address,
        city,
        state,
        zip_code,
        phone,
        email,
        account_number
      } = req.body;

      const data = {
        lastName: last_name,
        address,
        city,
        state,
        zipCode: zip_code,
        phone,
        email,
        accountNumber: account_number
      };

      // Only update the profile image if a new one is uploaded
      if (req.file) {
        data.profileImage = req.file.path;
      }

      const vendor = await prisma.vendor.update({
        where: { id: parseInt(req.params.id) },
        data
      });
      
      res.json(vendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ message: 'Error updating vendor' });
    }
  });

  // Delete vendor
  app.delete('/vendors/:id', authenticateToken, async (req, res) => {
    try {
      await prisma.vendor.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ message: 'Error deleting vendor' });
    }
  });
}; 