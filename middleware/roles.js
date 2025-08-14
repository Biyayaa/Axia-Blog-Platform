// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Middleware to check if user owns resource or is admin
const isOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    const resourceOwnerId = await getResourceOwnerId(req);
    if (
      req.user?.role === 'admin' ||
      resourceOwnerId.toString() === req.user?.id
    ) {
      return next();
    }
    return res.status(403).json({ message: 'Access denied' });
  };
};

module.exports = { isAdmin, isOwnerOrAdmin };
