var express = require("express");
var router = express.Router();
var authenticate = require("../utils/authenticate");
var mailer = require("../utils/mail");
const User = require("../models/user");
const Verification = require("../models/verification");

/* GET users listing. */
router.get("/", function (req, res, next) {
  // console.log("in");
  res.send({
    success: true,
    mssg: "Hello",
  });
});

router.post("/login", authenticate.local, (req, res, next) => {
  User.findById(req.user._id)
    .populate("wishlist")
    .populate({ path: "cart", populate: { path: "product" } })
    .populate({ path: "orders", populate: { path: "contents.product" } })
    .then((user) => {
      res.send({
        success: true,
        token: authenticate.getToken({ _id: req.user._id }),
        user: user,
      });
    })
    .catch((err) => next(err));
});

router.post("/forgot", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        let otp = mailer.sendOTP(user.email);
        user.otptoken = otp;
        user.save();
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    })
    .catch((err) => next(err));
});

router.post("/verify-otp", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user.otptoken == req.body.otp) {
        res.send({
          success: true,
          token: authenticate.getToken({ _id: user._id }),
        });
      } else {
        res.send({ success: false });
      }
    })
    .catch((err) => next(err));
});

router.post("/set-password", authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user).then((user) => {
    user
      .setPassword(req.body.password)
      .then((user) => {
        user.save();
        res.json({
          success: true,
          token: authenticate.getToken({ _id: user._id }),
        });
      })
      .catch((err) => next(err));
  });
});

router.post("/verify-email", (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user) => {
    if (!user) {
      let otp = mailer.sendOTP(req.body.email);
      Verification.create({
        email: req.body.email,
        otpToken: otp,
      })
        .then((verification) => {
          res.send({ success: true });
        })
        .catch((err) => next(err));
    } else {
      res.send({ success: false });
    }
  });
});

router.post("/verify-user", (req, res, next) => {
  //console.log(req.body);
  Verification.findOne({ email: req.body.email, otpToken: req.body.otp })
    .then((verification) => {
      if (verification) {
        //console.log("hi");
        res.send({ success: true });
      } else {
        res.send({ success: false });
      }
    })
    .catch((err) => next(err));
});

router.post("/sign-up", (req, res, next) => {
  let newUser = new User({
    email: req.body.email,
    name: req.body.name,
    contact: req.body.contact,
    address: req.body.address,
  });
  User.register(newUser, req.body.password, (err, user) => {
    if (!err) {
      res.json({
        user: user,
        success: true,
        token: authenticate.getToken({ _id: user._id }),
      });
    } else {
      res.json({ err: err });
    }
  });
});

router.post("/add-admin", (req, res, next) => {
  User.register(
    { ...req.body, admin: true },
    req.body.password,
    (err, user) => {
      if (!err) {
        res.json({
          user: user,
          success: true,
          token: authenticate.getToken({ _id: user._id }),
        });
      } else {
        res.json({ err: err });
      }
    }
  );
});

module.exports = router;
