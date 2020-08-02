const express = require("express");
const User = require("../models/user");
const Order = require("../models/order");
const Counter = require("../models/counter");
const authenticate = require("../utils/authenticate");
const { upload } = require("../utils/upload");

const router = express.Router();

router
  .route("/")
  .get((req, res, next) => {
    //send user details
    User.findById(req.user._id)
      .populate("wishlist")
      .populate({ path: "cart", populate: { path: "product" } })
      .populate({ path: "orders", populate: { path: "contents.product" } })
      .then((user) => {
        res.send({
          user: user,
        });
      })
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    //update user
    User.findById(req.user._id)
      .then((user) => {
        if (req.body.name) user.name = req.body.name;
        if (req.body.contact) user.contact = req.body.contact;
        if (req.body.address) user.address = req.body.address;
        if (req.body.gender) user.gender = req.body.gender;
        if (req.body.age) user.age = req.body.age;
        user.save().then((user) => {
          res.send({
            user: user,
          });
        });
      })
      .catch((err) => next(err));
  });

router.put("/changePassword", (req, res, next) => {
  User.findById(req.user._id).then((user) => {
    user
      .changePassword(req.body.oldPassword, req.body.newPassword)
      .then((user) => {
        res.json({
          success: true,
          token: authenticate.getToken({ _id: user._id }),
        });
      })
      .catch((err) => next(err));
  });
});

router.post("/uploadPhoto", upload.single("myImage"), (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      let filePath = req.file.path;
      filePath = filePath.replace(/\\/g, "/");
      user.image = req.file.path;
      // console.log("url", user.image);
      return user.save();
    })
    .then((user) => {
      res.send({
        image: user.image,
      });
    })
    .catch((err) => next(err));
});

router.get("/wishlist", (req, res, next) => {
  User.findById(req.user._id)
    .populate("wishlist")
    .then(
      (user) => {
        res.send(user.wishlist);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.get("/cart", (req, res, next) => {
  User.findById(req.user._id)
    .populate("cart.product")
    .then(
      (user) => {
        res.send({ cart: user.cart, cartTotal: user.cartTotal });
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.get("/orders", (req, res, next) => {
  User.findById(req.user._id)
    .populate({
      path: "orders",
      populate: {
        path: "contents.product",
      },
    })
    .then(
      (user) => {
        res.send(user.orders);
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});

router.get("/order/:orderId", (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("contents.product")
    .then((order) => {
      res.send(order);
    })
    .catch((err) => next(err));
});

router.put("/order/:orderId",(req,res,next) => {
  Order.findByIdAndUpdate(req.params.orderId,
    { $set : {status : req.body.status}},
    { safe: true, upsert:true, new:true})
    .populate("contents.product")
    .then((order) => {
      res.send(order);
    })
    .catch((err) => next(err));
})

router.delete("/order/:orderId",(req,res,next) => {
  Order.findByIdAndDelete(req.params.orderId)
  .then((order)=>{
    res.send({"success":true})
  })
})

router.post("/cart/placeOrder", (req, res, next) => {
  let conents = [];
  for (let i = 0; i < req.user.cart.length; i++) {
    conents.push({
      product: req.user.cart[i].product,
      size: req.user.cart[i].size,
      color: req.user.cart[i].color,
      price: req.user.cart[i].price,
      quantity: req.user.cart[i].quantity,
    });
  }
  Counter.findOneAndUpdate(
    { name: "orderId" },
    { $inc: { count: 1 } },
    { safe: true, new: true }
  ).then((counter) => {
    Order.create({
      _id: counter.count,
      contents: conents,
      amount: req.user.cartTotal,
      payment: {
        method: req.body.method,
        transactionid: 123,
      },
      address:req.user.address,
      contact:req.user.contact,
      user:req.user.email,
      userName: req.user.name,
      deliveryCharge : req.user.cartTotal>1000? 0 : 50
    })
    .then((order) => {
      // console.log(order);
      User.findById(req.user._id)
      .then((user) => {
        user.orders.splice(0,0,order._id); //add to orders
        //user.points += user.cartTotal*10/100
        //user.points = user.points.toFixed()
        user.cart = []; //clear cart
        user.cartTotal = 0;
        return User.populate(user,{ path: "orders", populate: { path: "contents.product" }})
      })
      .then((user) => {
        res.send({orders:user.orders,cart:user.cart,cartTotal:user.cartTotal,points:user.points})
        user.save()
      })
      .catch((err) => next(err));
    })
    .catch((err) => next(err));
  });
});

module.exports = router;