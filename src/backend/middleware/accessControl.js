// Access control middleware based on user level permissions
const checkAccess = (accessType) => {
  return (req, res, next) => {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has a userLevel
    if (!req.user.userLevel) {
      return res.status(403).json({ message: 'Access denied: No user level assigned' });
    }

    // Check specific access permission
    let hasAccess = false;
    switch(accessType) {
      case 'member':
        hasAccess = req.user.userLevel.memberAccess;
        break;
      case 'visitor':
        hasAccess = req.user.userLevel.visitorAccess;
        break;
      case 'vendor':
        hasAccess = req.user.userLevel.vendorAccess;
        break;
      case 'group':
        hasAccess = req.user.userLevel.groupAccess;
        break;
      case 'donation':
        hasAccess = req.user.userLevel.donationAccess;
        break;
      case 'admin':
        hasAccess = req.user.userLevel.adminAccess;
        break;
      case 'expense':
        hasAccess = req.user.userLevel.expenseAccess;
        break;
      case 'charges':
        hasAccess = req.user.userLevel.chargesAccess;
        break;
      case 'reports':
        hasAccess = req.user.userLevel.reportsAccess;
        break;
      case 'deposit':
        hasAccess = req.user.userLevel.depositAccess;
        break;
      case 'bank':
        hasAccess = req.user.userLevel.bankAccess;
        break;
      default:
        hasAccess = false;
    }

    if (hasAccess) {
      return next();
    }

    return res.status(403).json({ message: `Access denied: ${accessType} access required` });
  };
};

module.exports = {
  checkAccess
}; 