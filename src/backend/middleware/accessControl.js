// Access control middleware based on direct user permissions
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

    // Check specific access permission directly on user
    let hasAccess = false;
    switch(accessType) {
      case 'member':
        hasAccess = req.user.memberAccess;
        break;
      case 'visitor':
        hasAccess = req.user.visitorAccess;
        break;
      case 'vendor':
        hasAccess = req.user.vendorAccess;
        break;
      case 'group':
        hasAccess = req.user.groupAccess;
        break;
      case 'donation':
        hasAccess = req.user.donationAccess;
        break;
      case 'admin':
        hasAccess = req.user.adminAccess;
        break;
      case 'expense':
        hasAccess = req.user.expenseAccess;
        break;
      case 'charges':
        hasAccess = req.user.chargesAccess;
        break;
      case 'reports':
        hasAccess = req.user.reportsAccess;
        break;
      case 'deposit':
        hasAccess = req.user.depositAccess;
        break;
      case 'bank':
        hasAccess = req.user.bankAccess;
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

    // Check specific access permission and delete permission directly on user
    let hasAccess = false;
    let canDelete = true;
    
    switch(accessType) {
      case 'member':
        hasAccess = req.user.memberAccess;
        canDelete = !req.user.cannotDeleteMember;
        break;
      case 'visitor':
        hasAccess = req.user.visitorAccess;
        canDelete = !req.user.cannotDeleteVisitor;
        break;
      case 'vendor':
        hasAccess = req.user.vendorAccess;
        canDelete = !req.user.cannotDeleteVendor;
        break;
      case 'group':
        hasAccess = req.user.groupAccess;
        canDelete = !req.user.cannotDeleteGroup;
        break;
      case 'donation':
        hasAccess = req.user.donationAccess;
        canDelete = !req.user.cannotDeleteDonation;
        break;
      case 'expense':
        hasAccess = req.user.expenseAccess;
        canDelete = !req.user.cannotDeleteExpense;
        break;
      case 'charges':
        hasAccess = req.user.chargesAccess;
        canDelete = !req.user.cannotDeleteCharges;
        break;
      case 'reports':
        hasAccess = req.user.reportsAccess;
        canDelete = !req.user.cannotDeleteReports;
        break;
      case 'deposit':
        hasAccess = req.user.depositAccess;
        canDelete = !req.user.cannotDeleteDeposit;
        break;
      case 'bank':
        hasAccess = req.user.bankAccess;
        canDelete = !req.user.cannotDeleteBank;
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

// Check if user has add permission for a specific resource
const checkAddAccess = (accessType) => {
  return (req, res, next) => {
    // First check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Super admin can add everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check specific access permission and add permission directly on user
    let hasAccess = false;
    let canAdd = false;
    
    switch(accessType) {
      case 'member':
        hasAccess = req.user.memberAccess;
        canAdd = req.user.canAddMember;
        break;
      case 'visitor':
        hasAccess = req.user.visitorAccess;
        canAdd = req.user.canAddVisitor;
        break;
      case 'vendor':
        hasAccess = req.user.vendorAccess;
        canAdd = req.user.canAddVendor;
        break;
      case 'group':
        hasAccess = req.user.groupAccess;
        canAdd = req.user.canAddGroup;
        break;
      case 'donation':
        hasAccess = req.user.donationAccess;
        canAdd = req.user.canAddDonation;
        break;
      case 'expense':
        hasAccess = req.user.expenseAccess;
        canAdd = req.user.canAddExpense;
        break;
      case 'charges':
        hasAccess = req.user.chargesAccess;
        canAdd = req.user.canAddCharges;
        break;
      case 'reports':
        hasAccess = req.user.reportsAccess;
        canAdd = req.user.canAddReports;
        break;
      case 'deposit':
        hasAccess = req.user.depositAccess;
        canAdd = req.user.canAddDeposit;
        break;
      case 'bank':
        hasAccess = req.user.bankAccess;
        canAdd = req.user.canAddBank;
        break;
      default:
        hasAccess = false;
        canAdd = false;
    }

    if (hasAccess && canAdd) {
      return next();
    }

    return res.status(403).json({ message: `Access denied: You don't have permission to add ${accessType}` });
  };
};

module.exports = {
  checkAccess,
  checkDeleteAccess,
  checkAddAccess
}; 