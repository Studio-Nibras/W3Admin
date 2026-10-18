function requireAuth(req, res, next) {
  if (!req.session?.admin?.id) {
    return res.status(401).json({
      message: "Authentication required. Please log in.",
    });
  }

  next();
}

module.exports = requireAuth;
