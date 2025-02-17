const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'church-members',
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

// Add the upload image endpoint
router.post('/upload-image', upload.single('image'), async (req, res) => {
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

module.exports = (app) => {
  const prisma = app.get('prisma');

  app.post('/upload-image', upload.single('image'), async (req, res) => {
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

  // Get all members
  app.get('/members', async (req, res) => {
    try {
      const members = await prisma.member.findMany({
        include: {
          groups: {
            include: {
              group: true
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
      res.status(500).json({ message: 'Error fetching members' });
    }
  });

  // Get single member
  app.get('/members/:id', async (req, res) => {
    try {
      const member = await prisma.member.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          groups: {
            include: {
              group: true
            }
          }
        }
      });

      // Transform the groups data to match the expected format
      const formattedMember = {
        ...member,
        groups: member.groups.map(membership => ({
          id: membership.group.id,
          name: membership.group.name,
          description: membership.group.description
        }))
      };

      res.json(formattedMember);
    } catch (error) {
      console.error('Error fetching member:', error);
      res.status(500).json({ message: 'Error fetching member' });
    }
  });

  // Create member
  app.post('/members', async (req, res) => {
    try {
      console.log('Received member data:', req.body); // Debug log
      const member = await prisma.member.create({
        data: {
          firstName: req.body.first_name,
          middleName: req.body.middle_name,
          lastName: req.body.last_name,
          isActive: req.body.is_active,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          birthday: req.body.birthday,
          gender: req.body.gender,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          membershipDate: req.body.membership_date,
          baptismalDate: req.body.baptismal_date,
          profileImage: req.body.profile_image,
          groups: {
            create: req.body.groups.map(groupId => ({
              group: {
                connect: { id: parseInt(groupId) }
              }
            }))
          }
        },
        include: {
          groups: {
            include: {
              group: true
            }
          }
        }
      });
      console.log('Created member:', member); // Debug log
      res.json(member);
    } catch (error) {
      console.error('Error creating member:', error);
      res.status(500).json({ message: 'Error creating member', error: error.message });
    }
  });

  // Update member
  app.put('/members/:id', async (req, res) => {
    try {
      console.log('Updating member:', req.params.id, req.body);
      
      const member = await prisma.member.update({
        where: { id: parseInt(req.params.id) },
        data: {
          firstName: req.body.first_name,
          middleName: req.body.middle_name,
          lastName: req.body.last_name,
          isActive: req.body.is_active,
          address: req.body.address,
          city: req.body.city,
          state: req.body.state,
          zipCode: req.body.zip_code,
          birthday: req.body.birthday,
          gender: req.body.gender,
          cellPhone: req.body.cell_phone,
          email: req.body.email,
          membershipDate: req.body.membership_date,
          baptismalDate: req.body.baptismal_date,
          profileImage: req.body.profile_image,
          groups: {
            deleteMany: {}, // Remove all existing connections
            create: req.body.groups.map(groupId => ({
              group: {
                connect: { id: parseInt(groupId) }
              }
            }))
          }
        },
        include: {
          groups: {
            include: {
              group: true
            }
          }
        }
      });
      
      console.log('Updated member:', member);
      res.json(member);
    } catch (error) {
      console.error('Error updating member:', error);
      res.status(500).json({ message: 'Error updating member', error: error.message });
    }
  });

  // Add delete endpoint for members
  app.delete('/members/:id', async (req, res) => {
    try {
      await prisma.member.delete({
        where: { id: parseInt(req.params.id) }
      });
      res.json({ message: 'Member deleted successfully' });
    } catch (error) {
      console.error('Error deleting member:', error);
      res.status(500).json({ message: 'Error deleting member' });
    }
  });
}; 