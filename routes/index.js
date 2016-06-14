var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Blog = require('../models/blog');
var Comment = require('../models/comment');
var crypto = require('crypto');
var checkLogin = require('../assist/checkLogin');
var checkLogout = require('../assist/checkLogout');
var checkBlog = require('../assist/checkBlog');
var createDp = require('../assist/createDp');

var getItems = function(req, title) {
  return {
    title:title,
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  };
};

var createPassword = function(password){
  var md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
};


router.get('/', function(req, res) {
  var page = parseInt(req.query.p) || 1;
  var items = getItems(req, 'HomePage');
  Blog.getTen(null, page, function(err, blogs, total){
    if(err){blogs = [];}
    items.blogs = blogs;
    items.page = page;
    items.isFirstPage = (page - 1) == 0;
    items.isLastPage = ((page - 1) * 10 + blogs.length) == total,
    res.render('index', items);
  });
});

router.get('/reg',checkLogout);
router.get('/reg', function (req, res) {
    res.render('register', getItems(req, 'Register'));
});

router.post('/reg',checkLogout);
router.post('/reg', function (req, res) {
  if(req.body.password != req.body['password-repeat']){
    req.flash('error','Different password,type again');
    return res.redirect('/reg');
  }

  User.get(req.body.name, function (err, user) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    if (user) {
      req.flash('error', 'user already exist');
      return res.redirect('/reg');
    }

    var newUser = new User({
        name: req.body.name,
        password: createPassword(req.body.password),
        email: req.body.email,
        head: createDp(req.body.email)
    });

    newUser.save(function (err, user) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/reg');
      }
      req.session.user = newUser;
      req.flash('success', 'register complete');
      res.redirect('/');
    });
  });
});

router.get('/login',checkLogout);
router.get('/login', function (req, res) {
  res.render('login', getItems(req, 'Login'));
});

router.post('/login',checkLogout);
router.post('/login', function (req, res) {
  User.get(req.body.name, function(err,user){
    if(!user){
      req.flash('error', 'user not exist');
      return res.redirect('/login');
    }
    if(user.password != createPassword(req.body.password)){
      req.flash('error', 'password error');
      return res.redirect('/login');
    }
    req.session.user = user;
    req.flash('success', 'login success');
    res.redirect('/');
  });
});

router.get('/blog', checkLogin);
router.get('/blog', function (req, res) {
  res.render('blog', getItems(req, 'blog'));
});

router.post('/blog', checkLogin);
router.post('/blog', function (req, res) {
  // console.log(req.body);
  // var checkInput = checkBlog(req,res);
  // if (checkInput) {
  //   req.flash('error',checkInput.error);
  //   return res.redirect('/blog');
  // }
  console.log(req.session.user.head);
  console.log(req.session.user);
  var blog = new Blog(req.session.user.name, req.body.title, req.body.content, req.session.user.head);
  blog.save(function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/blog');
    }
    req.flash('success', 'your blog has been submitted');
    //res.redirect('/');
  });
});

router.get('/logout', checkLogin);
router.get('/logout', function (req, res) {
  req.session.user = null;
  req.flash('success','logout success');
  res.redirect('/');
});

router.get('/u/:name', function(req,res){
  var page = parseInt(req.query.p) || 1;
  User.get(req.params.name, function(err, user){
    if(!user){
      req.flash('error',err);
      return res.redirect('/');
    }
    Blog.getTen(req.params.name, page, function(err, blogs, total){
        if(err){
          req.flash('error',err);
          return res.redirect('/');
        }
        var items = getItems(req, req.params.name);
        items.blogs = blogs;
        items.page = page;
        items.isFirstPage = (page - 1) == 0;
        items.isLastPage = ((page - 1) * 10 + blogs.length) == total,
        console.log(items);
        res.render('user',items);
    });
  });
});

router.get('/u/:name/:time/:title', function(req, res){
  Blog.getOne(req.params.name, req.params.time, req.params.title, function(err, blogs){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    var items = getItems(req, req.params.name);
    items.blogs = blogs;
    // console.log(items);
    res.render('article',items);
  });
});

router.post('/u/:name/:time/:title', checkLogin);
router.post('/u/:name/:time/:title', function(req, res){
  Blog.update(req.params.name, req.params.time, req.params.title, req.body.content, function(err){
    if(err){
      req.flash('error',err);
      return res.redirect('/');
    }
    req.flash('success', 'Update success');
    res.redirect(encodeURI('/u/' + req.params.name + '/' + req.params.time + '/' + req.params.title));
  });
});

router.get('/remove/:name/:time/:title', checkLogin);
router.get('/remove/:name/:time/:title', function(req, res){
  if (req.session.user.name != req.params.name) {
    req.flash('error', 'delete your own blog ');
    return res.redirect('/');
  }
  Blog.remove(req.session.user.name, req.params.time, req.params.title, function(err){
    if(err){
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', 'delete complete');
    res.redirect('/');
  });
});
/* GET home page. */

router.post('/comment', function(req, res){
  var date = new Date();
  var commentTime = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
  var comment = {
      commentUser: req.session.user.name,
      commentTime: commentTime,
      commentContent: req.body.comment,
      head : createDp(req.session.user.email)
  };
  var newComment = new Comment(req.body.name, req.body.time, req.body.title, comment);
  newComment.save(function(err){
    if(err){
      console.log('######save comment failed');
    }
  });
});

router.get('/search', function(req, res){
  Blog.search(req.query.keyword, function(err, blogs){
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    var items = getItems(req, "SEARCH:" + req.query.keyword);
    items.blogs = blogs;
    res.render('search',items);
  });
});

router.get('*', function(req, res){
  res.render('404');
});

module.exports = router;
