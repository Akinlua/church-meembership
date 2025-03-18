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

// Check if user has delete permission for a specific resource
const checkDeleteAccess = (accessType) => {
  return (req, res, next) => {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin can delete everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has a userLevel
    if (!req.user.userLevel) {
      return res.status(403).json({ message: 'Access denied: No user level assigned' });
    }

    // Check specific access permission and delete permission
    let hasAccess = false;
    let canDelete = true;
    
    switch(accessType) {
      case 'member':
        hasAccess = req.user.userLevel.memberAccess;
        canDelete = !req.user.userLevel.cannotDeleteMember;
        break;
      case 'visitor':
        hasAccess = req.user.userLevel.visitorAccess;
        canDelete = !req.user.userLevel.cannotDeleteVisitor;
        break;
      case 'vendor':
        hasAccess = req.user.userLevel.vendorAccess;
        canDelete = !req.user.userLevel.cannotDeleteVendor;
        break;
      case 'group':
        hasAccess = req.user.userLevel.groupAccess;
        canDelete = !req.user.userLevel.cannotDeleteGroup;
        break;
      case 'donation':
        hasAccess = req.user.userLevel.donationAccess;
        canDelete = !req.user.userLevel.cannotDeleteDonation;
        break;
      case 'expense':
        hasAccess = req.user.userLevel.expenseAccess;
        canDelete = !req.user.userLevel.cannotDeleteExpense;
        break;
      case 'charges':
        hasAccess = req.user.userLevel.chargesAccess;
        canDelete = !req.user.userLevel.cannotDeleteCharges;
        break;
      case 'reports':
        hasAccess = req.user.userLevel.reportsAccess;
        canDelete = !req.user.userLevel.cannotDeleteReports;
        break;
      case 'deposit':
        hasAccess = req.user.userLevel.depositAccess;
        canDelete = !req.user.userLevel.cannotDeleteDeposit;
        break;
      case 'bank':
        hasAccess = req.user.userLevel.bankAccess;
        canDelete = !req.user.userLevel.cannotDeleteBank;
        break;
      default:
        hasAccess = false;
        canDelete = false;
    }

    if (hasAccess && canDelete) {
      return next();
    }

    return res.status(403).json({ message: `Access denied: You don't have permission to delete this ${accessType}` });
  };
};

module.exports = {
  checkAccess,
  checkDeleteAccess
}; 