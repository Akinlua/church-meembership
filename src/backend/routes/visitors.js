const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { checkAccess, checkDeleteAccess } = require('../middleware/accessControl');

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

// Add this helper function at the top of your file
const generateVisitorNumber = async (prisma) => {
  // Find the highest visitor number
  const lastVisitor = await prisma.visitor.findFirst({
    orderBy: {
      visitorNumber: 'desc'
    }
  });
  
  // Start with V00101 if no visitors exist
  if (!lastVisitor || !lastVisitor.visitorNumber) {
    return 'V00101';
  }
  
  // If the last visitor has a formatted number, parse it and increment
  const numericPart = parseInt(lastVisitor.visitorNumber.substring(1), 10);
  const nextNumber = numericPart + 1;
  
  // Format to 5 digits with leading zeros and prepend 'V'
  return 'V' + nextNumber.toString().padStart(5, '0');
};

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
      const { ownDataOnly, userId } = req.query;
      let whereClause = {};
      
      // If ownDataOnly is true and userId is provided, filter by the user's visitorId
      if (ownDataOnly === 'true' && userId) {
        // Get the user with their visitorId
        const user = await prisma.user.findUnique({
          where: { id: parseInt(userId) },
          select: { visitorId: true }
        });
        
        if (user && user.visitorId) {
          whereClause.id = user.visitorId;
        } else {
          // If user has no visitorId, return empty array
          return res.json([]);
        }
      }
      
      const visitors = await prisma.visitor.findMany({
        where: whereClause,
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
      console.log('Received visitor data:', req.body);
      
      // Generate the next visitor number
      const visitorNumber = await generateVisitorNumber(prisma);
      
      const visitor = await prisma.visitor.create({
        data: {
          firstName: req.body.first_name,
          lastName: req.body.last_name,
          middleInitial: req.body.middle_initial,
          visitorNumber: visitorNumber, // Use the generated number
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          homeChurch: req.body.home_church,
          profileImage: req.body.profile_image,
        }
      });
      
      console.log('Created visitor:', visitor);
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
      
      // Check if this is the user's own visitor record
      const visitorId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the user to check if this is their own visitor record
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          visitorId: true,
          role: true,
          visitorAccess: true 
        }
      });
      
      // If this is not the user's own record and they don't have access, reject the request
      if (user.visitorId !== visitorId && user.role !== 'admin' && !user.visitorAccess) {
        return res.status(403).json({ message: 'You do not have permission to update this visitor' });
      }
      
      const visitor = await prisma.visitor.update({
        where: { id: visitorId },
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
      // Check if this is the user's own visitor record
      const visitorId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Get the user to check if this is their own visitor record
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          visitorId: true,
          role: true,
          visitorAccess: true,
          cannotDeleteVisitor: true
        }
      });
      
      // Allow if this is the user's own record OR they have delete access
      const isOwnRecord = user.visitorId === visitorId;
      const hasDeletePermission = user.role === 'admin' || (user.visitorAccess && !user.cannotDeleteVisitor);
      
      if (!isOwnRecord && !hasDeletePermission) {
        return res.status(403).json({ message: 'You do not have permission to delete this visitor' });
      }
      
      await prisma.visitor.delete({
        where: { id: visitorId }
      });
      res.json({ message: 'Visitor deleted successfully' });
    } catch (error) {
      console.error('Error deleting visitor:', error);
      res.status(500).json({ message: 'Error deleting visitor' });
    }
  });
}; 