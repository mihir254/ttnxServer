const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
  },
  address: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },
  gender: {
    type: String,
  },
  age: {
    type: Number,
  },
  points: {
    type: Number,
    default: 0,
  },
  orders: [
    {
      type: Number,
      ref: "Order",
    },
  ],
  wishlist: [
    {
      type: String,
      ref: "Product",
    },
  ],
  cart: [
    {
      product: {
        type: String,
        ref: "Product",
      },
      size: String,
      color: String,
      quantity: Number,
      price: Number,
    },
  ],
  cartTotal: {
    type: Number,
    default: 0,
  },
  otptoken: String,
  admin: {
    type: Boolean,
  },
});
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });

const User = mongoose.model("User", userSchema);
module.exports = User;
