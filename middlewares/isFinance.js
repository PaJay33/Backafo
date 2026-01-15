module.exports = (req, res, next) => {
  if (req.user && (req.user.role === 'finance' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Interdit: Finance ou Admin seulement' });
  }
};
