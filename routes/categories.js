const express = require("express");
const Category = require("../models/category");
const Product = require("../models/product");

const router = express.Router();

// Adding category
router.post("/", (req, res, next) => {
  let id = 0;
  Category.find()
    .then((cats) => {
      id = cats.length + 1;
      let ancestors = req.body.ancestors;
      return Category.create({
        _id: id,
        ...req.body,
        parent: ancestors[ancestors.length - 1],
      });
    })
    .then((cat) => res.send(cat))
    .catch((err) => next(err));
});

router.get("/:catId/get-leaf", (req, res, next) => {
  Category.find(
    { ancestors: req.params.catId, isLeaf: true },
    { _id: 1, name: 1, image: 1 }
  )
    .then((cats) => {
      res.send(cats);
    })
    .catch((err) => next(err));
});

// For getting sub-categories
router.get("/:catId/get-subs", (req, res, next) => {
  Category.find({ parent: req.params.catId }, { _id: 1, name: 1, image: 1 })
    .then((cats) => {
      if (cats.length == 0) {
        res.redirect("/category/" + req.params.catId + "/get-products");
      } else {
        res.send(cats);
      }
    })
    .catch((err) => next(err));
});

createFilter = (body) => {
  filter = {};
  keys = Object.keys(body);
  if (keys.includes("color")) {
    filter.colors = { $in: body.color };
  }
  if (keys.includes("priceLower")) {
    filter.price = { $gt: body.priceLower, $lt: body.priceUpper };
  }
  if (keys.includes("discountPercentage")) {
    filter.discountPercentage = { $gte: body.discountPercentage };
  }
  filter.deleted = { $ne: true };
  return filter;
};

// For getting products of catId and ancestors of catId
router.get("/:catId/get-products/:pageNo", (req, res, next) => {
  // console.log("object", req.params.catId);
  Category.find({ ancestors: req.params.catId })
    .distinct("_id")
    .then((cats) => {
      cats.push(Number(req.params.catId));
      filter = createFilter(req.body);
      filter.category = { $in: cats };
      // console.log(req.body);
      if (req.body.sort === "Price") {
        return Product.find(filter).sort({ price: req.body.order });
      } else {
        return Product.find(filter);
      }
    })
    .then((prods) => {
      start = (req.params.pageNo - 1) * 10;
      end = req.params.pageNo * 10;
      prods = prods.slice(start, end);
      if (prods.length == 0) {
        res.send({ end: true });
      } else {
        res.send(prods);
      }
    })
    .catch((err) => next(err));
});

router.post("/:catId/get-products/:pageNo", (req, res, next) => {
  // console.log("object", req.params.catId);
  Category.find({ ancestors: req.params.catId })
    .distinct("_id")
    .then((cats) => {
      cats.push(Number(req.params.catId));
      filter = createFilter(req.body);
      filter.category = { $in: cats };
      // console.log(req.body);
      if (req.body.sort === "Price") {
        return Product.find(filter).sort({ price: req.body.order });
      } else {
        return Product.find(filter);
      }
    })
    .then((prods) => {
      start = (req.params.pageNo - 1) * 10;
      end = req.params.pageNo * 10;
      prods = prods.slice(start, end);
      if (prods.length == 0) {
        res.send({ end: true });
      } else {
        res.send(prods);
      }
    })
    .catch((err) => next(err));
});

module.exports = router;
