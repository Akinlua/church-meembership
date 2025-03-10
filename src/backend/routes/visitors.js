const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary (reusing the same configuration from members routes)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'church-visitors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Image upload endpoint
  app.post('/upload-visitor-image', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      res.json({ 
        imageUrl: req.file.path,
        publicId: req.file.filename 
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Error uploading image' });
    }
  });

  // Get all visitors
  app.get('/visitors', authenticateToken, async (req, res) => {
    try {
      const visitors = await prisma.visitor.findMany({
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      });
      res.json(visitors);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      res.status(500).json({ message: 'Error fetching visitors' });
    }
  });

  // Get single visitor
  app.get('/visitors/:id', authenticateToken, async (req, res) => {
    try {
      const visitor = await prisma.visitor.findUnique({
        where: { id: parseInt(req.params.id) }
      });

      if (!visitor) {
        return res.status(404).json({ message: 'Visitor not found' });
      }

      res.json(visitor);
    } catch (error) {
      console.error('Error fetching visitor:', error);
      res.status(500).json({ message: 'Error fetching visitor' });
    }
  });

  // Create visitor
  app.post('/visitors', authenticateToken, async (req, res) => {
    try {
      console.log('Received visitor data:', req.body); // Debug log
      const visitor = await prisma.visitor.create({
        data: {
          firstName: req.body.first_name,
          lastName: req.body.last_name,
          middleInitial: req.body.middle_initial,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          homeChurch: req.body.home_church,
          profileImage: req.body.profile_image,
        //   visitDate: req.body.visit_date || new Date()
        }
      });
      console.log('Created visitor:', visitor); // Debug log
      res.json(visitor);
    } catch (error) {
      console.error('Error creating visitor:', error);
      res.status(500).json({ message: 'Error creating visitor', error: error.message });
    }
  });

  // Update visitor
  app.put('/visitors/:id', authenticateToken, async (req, res) => {
    try {
      console.log('Updating visitor:', req.params.id, req.body);
      
      const visitor = await prisma.visitor.update({
        where: { id: parseInt(req.params.id) },
        data: {
          firstName: req.body.first_name,
          lastName: req.body.last_name,
          middleInitial: req.body.middle_initial,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          homeChurch: req.body.home_church,
          profileImage: req.body.profile_image,
        //   visitDate: req.body.visit_date
        }
      });
      
      console.log('Updated visitor:', visitor);
      res.json(visitor);
    } catch (error) {
      console.error('Error updating visitor:', error);
      res.status(500).json({ message: 'Error updating visitor', error: error.message });
    }
  });

  // Delete visitor
  app.delete('/visitors/:id', authenticateToken, async (req, res) => {
    try {
      await prisma.visitor.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Visitor deleted successfully' });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      res.status(500).json({ message: 'Error deleting visitor' });
    }
  });
}; 