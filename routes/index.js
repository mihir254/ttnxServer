var express = require("express");
var router = express.Router();
var fs = require("fs");
var path = require("path");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({ name: "vidhi" });
});
// router.get("/:path", (req, res, next) => {
//   let filepath = req.params.path;
//   // console.log(filepath + "\n");
//   filepath = filepath.replace(/%5C/g, "/");
//   filepath = filepath.replace(/\\/g, "/");
//   if (fs.existsSync(filepath)) {
//     // console.log(filepath);
//     // console.log("file found" + filepath);
//     res.sendFile(path.join(path.join(__dirname, "../"), filepath));
//   } else {
//     //console.log(path);
//     //console.log("file not fount " + path);
//     // console.log(filepath)
//     res.statusCode = 404;
//     res.send({ success: false });
//   }
// });
module.exports = router;
