const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const authenticate = require("../utils/authenticate");
const { upload } = require("../utils/upload");

const router = express.Router();

router.get("/", (req, res, next) => {
  res.send({ admin: true });
});

//all about orders
router.get("/orders", (req, res, next) => {
  Order.find()
    .sort({ _id: -1 })
    .populate("contents.product")
    .then((orders) => {
      res.send(orders);
    })
    .catch((err) => next(err));
});

router
  .route("/orders/:orderId")
  .get((req, res, next) => {
    Order.findById(req.params.orderId)
      .populate("contents.product")
      .then((order) => {
        res.send(order);
      })
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: { ...req.body } },
      { safe: true, upsert: true, new: true }
    )
      .populate("contents.product")
      .then((order) => {
        res.send(order);
      })
      .catch((err) => next(err));
  })
  .delete((req, res, next) => {
    Order.findByIdAndDelete(req.params.orderId)
      .then((order) => {
        res.send(order);
      })
      .catch((err) => next(err));
  });

//all about products
router.post("/products", upload.array("myImages"), (req, res, next) => {
  let paths = [];
  for (let i = 0; i < req.files.length; i++) {
    paths.push(req.files[i].path.replace(/\\/g, "/"));
  }
  let product = {
    ...req.body,
    images: paths,
    colors: req.body.colors.split(","),
    size: req.body.size.split(","),
  };
  Product.create(product)
    .then((prod) => {
      return Product.findById(prod._id);
    })
    .then((prod) => res.send(prod))
    .catch((err) => next(err));
});

router
  .route("/products/deleted")
  .get((req, res, next) => {
    Product.find({ deleted: true })
      .then((products) => res.send(products))
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    Product.findByIdAndUpdate(
      req.body.id,
      { $set: { deleted: false } },
      { safe: true, upsert: true, new: true }
    )
      .then((obj) => res.send(obj))
      .catch((err) => console.log(err));
  });

router
  .route("/products/:productId")
  .get((req, res, next) => {
    Product.findById(req.params.productId)
      .then((product) => {
        res.send(product);
      })
      .catch((err) => next(err));
  })
  .put((req, res, next) => {
    Product.findByIdAndUpdate(
      req.params.productId,
      { $set: req.body },
      { safe: true, upsert: true, new: true }
    )
      .then((product) => {
        res.send(product);
      })
      .catch((err) => console.log(err));
  })
  .delete((req, res, next) => {
    Product.findByIdAndUpdate(
      req.params.productId,
      { $set: { deleted: true } },
      { safe: true, upsert: true, new: true }
    )
      .then((product) => {
        res.send(product);
      })
      .catch((err) => console.log(err));
  });

module.exports = router;
