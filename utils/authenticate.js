const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const secretKey = "1234-5678";

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.local = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user) => {
    if (err) next(err);
    if (!user) {
      (res.statusCode = 401),
        res.json({
          success: false,
          message: "Incorrect ID/ Password",
        });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

exports.getToken = (user) => {
  return jwt.sign(user, secretKey);
};
let opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: secretKey,
};

passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        return done(null, user);
      } else {
        //user not found
        return done(null, false);
      }
    });
  })
);

exports.verifyAdmin = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) next(err);
    if (!user.admin && !user) {
      (res.statusCode = 401),
        res.json({
          success: false,
          message: "Unauthorized",
        });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};

//middleware verify using jwt
exports.verifyUser = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) next(err);
    if (!user) {
      (res.statusCode = 401),
        res.json({
          success: false,
          message: "Unauthorized",
        });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};
