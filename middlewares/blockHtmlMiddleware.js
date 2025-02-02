module.exports = (req, res, next) => {
    if (req.path.endsWith('.html')) {
      return res.status(403).json({ error: 'Acceso prohibido' });
    }
    next();
  };
  