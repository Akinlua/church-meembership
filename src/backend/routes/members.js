const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authenticateToken } = require('../middleware/auth');
const { checkAccess } = require('../middleware/accessControl');

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

// Add this helper function at the top of your file
const generateMemberNumber = async (prisma) => {
  // Find the highest member number
  const lastMember = await prisma.member.findFirst({
    orderBy: {
      memberNumber: 'desc'
    }
  });
  
  // Start with 00101 if no members exist
  if (!lastMember || !lastMember.memberNumber) {
    return '00101';
  }
  
  // If the last member has a formatted number, parse it and increment
  const numericPart = parseInt(lastMember.memberNumber, 10);
  const nextNumber = numericPart + 1;
  
  // Format to 5 digits with leading zeros
  return nextNumber.toString().padStart(5, '0');
};

module.exports = (app) => {
  const prisma = app.get('prisma');

  // Apply member access middleware to all member routes
  app.use('/members', authenticateToken, checkAccess('member'));

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
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid member ID format' });
      }
      
      const member = await prisma.member.findUnique({
        where: { id: id },
        include: {
          groups: {
            include: {
              group: true
            }
          }
        }
      });
      
      if (!member) {
        return res.status(404).json({ message: 'Member not found' });
      }

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
      console.log('Received member data:', req.body);
      
      // Generate the next member number
      const memberNumber = await generateMemberNumber(prisma);
      
      const member = await prisma.member.create({
        data: {
          firstName: req.body.first_name,
          middleName: req.body.middle_name,
          lastName: req.body.last_name,
          memberNumber: memberNumber, // Use the generated number
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
          pastChurch: req.body.past_church,
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
      
      console.log('Created member:', member);
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
          pastChurch: req.body.past_church,
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