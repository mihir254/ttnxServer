const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  _id: {
    type: Number,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  parent: Number,
  isLeaf: Boolean,
  ancestors: [Number],
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
