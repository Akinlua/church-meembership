const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get the prisma client from the app
    const prisma = req.app.get('prisma');
    
    // Fetch the user with their userLevel to get the latest permissions
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { userLevel: true }
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach the user to the request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Check if user is admin (either by role or userLevel)
const isAdmin = (req, res, next) => {
  if (req.user.role === 'admin' || (req.user.userLevel && req.user.userLevel.adminAccess)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Admin privileges required' });
};

module.exports = {
  authenticateToken,
  isAdmin
}; 