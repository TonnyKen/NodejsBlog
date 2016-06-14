module.exports = function(req, res, next) {
  if(!req.session.user) {
    req.flash('error', 'Not login now. Please login first');
    res.redirect('/login');
  }
  next();
};
