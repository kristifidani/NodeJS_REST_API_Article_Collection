const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user");
const bcrypt = require("bcryptjs");

module.exports = function(passport) {
  //Local strategy
  passport.use(
    new LocalStrategy(function(username, password, done) {
      //Match email
      let query = { username };
      User.findOne(query, function(err, user) {
        if (err) throw err;
        if (!user) {
          return done(null, false, { message: "No user found" });
        }
        //check if user is active 
        if (user.active == false) {
          return done(null, false, { message: "Confirm email first" });
        } else {
          //Match password
          bcrypt.compare(password, user.password, function(err, isMatch) {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Wrong password" });
            }
          });
        }
        //console.log(user);
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};