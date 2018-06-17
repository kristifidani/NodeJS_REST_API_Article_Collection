const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Bring in Article Model
let User = require("../models/user");

//Register form
router.get("/register", function(req, res) {
  res.render("register");
});

//Register process
router.post("/register", function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody("name", "Name is required to have between 6 to 15 characters including only letters and digits !"
    ).matches("[A-Za-z0-9]{6,15}");
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req
    .checkBody("username", "Username is required to have between 6 to 15 characters including only letters and digits !"
    ).matches("[A-Za-z0-9]{6,15}");
  req
    .checkBody("password", "Password is required to have 6 characters including uppers case, digit and special characters !"
    ).matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$");
  req.checkBody("password2", "Passwords do not match").equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors
    });
  } else {
    User.findOne({ username: req.body.username }, function(err, user) {
      if (err) {
        console.log(err);
      } else if (user) {
        console.log("user exists");
        //console.log(user)
      } else {
        let newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password
        });

        //Pjesa e passwordit qe e inkripton
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) {
              console.log(err);
            }
            newUser.password = hash;
            newUser.save(function(err) {
              if (err) {
                console.log(err);
                return;
              } else {
                req.flash("success", "You are now registered and can log in");
                res.redirect("/");
              }
            });
          });
        });
      }
    });
  }
});

//Login process
router.post("/login", function(req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/articles",
    failureRedirect: "/",
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get("/logout", function(req, res) {
  req.logout();
  req.flash("success", "You are logged out");
  res.redirect("/");
});

module.exports = router;