module.exports = function(req, res, next) {
  if(req.session.user) {
    req.flash('error', 'user already login');
    res.redirect('back');
  }
  next();
};
