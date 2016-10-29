var express = require("express");
var passport = require("passport");
var multer  = require('multer');
var upload = multer({ dest: 'uploads/'});
var async = require("async");
var User = require("./models/user");
var Photo = require("./models/photo");
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash("info", "You must be logged in to see this page.");
    res.redirect("/login");
  }
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash("error");
  res.locals.infos = req.flash("info");
  next();
});

router.get("/", function(req, res, next) {
    if(req.user){
        async.series([
            function(callback){
                Photo.find({user: req.user.username}).exec(callback);
            },
            function(callback){
                Photo.find({user: { $ne: req.user.username }}).exec(callback);
            }
        ],function(err, results){
            res.render("index",{
                photos: results[0],
                otherPhotos: results[1]
            });
        })
    } else {
        res.render("index");
    }
});

router.post("/", upload.single('upload-img'), function(req, res, next){
    var newPhoto = new Photo({
        user: req.user.username,
        description: req.body.comment,
        image: req.file.filename
    });
    req.flash("info", "Photo uploaded");
    res.redirect("/");
    newPhoto.save(next);
});


router.get("/login", function(req, res) {
  res.render("login");
});

router.post("/login", passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true
}));

router.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

router.get("/signup", function(req, res) {
  res.render("signup");
});

router.post("/signup", upload.single('avatar'), function(req, res, next) {

  var username = req.body.username;
  var password = req.body.password;
  var photo_url = req.file.filename;
  User.findOne({ username: username }, function(err, user) {

    if (err) { return next(err); }
    if (user) {
      req.flash("error", "User already exists");
      return res.redirect("/signup");
    }

    var newUser = new User({
      username:  username,
      password:  password,
      photo_url: photo_url
    });
    newUser.save(next);
  });
}, passport.authenticate("login", {
  successRedirect: "/",
  failureRedirect: "/signup",
  failureFlash: true
}));

router.get("/users/:username", function(req, res, next) {
  User.findOne({ username: req.params.username }, function(err, user) {
    if (err) { return next(err); }
    if (!user) { return next(404); }
    return user;
  });
});

router.get("/edit", ensureAuthenticated, function(req, res) {
    res.render("edit");
});

router.post("/edit", ensureAuthenticated, function(req, res, next) {
  req.user.username = req.body.displayname;
  req.user.save(function(err) {
    if (err) {
      next(err);
      return;
    }
    req.flash("info", "Profile updated!");
    res.redirect("/edit");
  });
});


module.exports = router;
