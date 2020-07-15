var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors");

var authenticate = require("./utils/authenticate");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var categoriesRouter = require("./routes/categories");
var productsRouter = require("./routes/products");
var profileRouter = require("./routes/profile");
var adminRouter = require("./routes/admin");

var app = express();
// app.all('*',(req,res,next) => {
//   if(req.secure){
//     return next();
//   }else{
//     console.log('rerouted http to https');
//     res.redirect(307,'https://' + req.hostname + ':' + app.get('secPort') + req.url);
//   }
// })
// MongoDb connection

mongoose_connections = [
  "mongodb://localhost/ttnx", //0
  "mongodb+srv://vidhi:pass@cluster0.70qps.mongodb.net/ttnx?retryWrites=true&w=majority", //1
  "mongodb+srv://mihirdb:mihirdb@cluster0-auvdn.mongodb.net/ttnx?retryWrites=true&w=majority", //2
  "mongodb+srv://admin:admin@cluster0-zzmbm.mongodb.net/ttnx?retryWrites=true&w=majority", //3
  "mongodb://vidhi:pass@cluster0-shard-00-00.70qps.mongodb.net:27017,cluster0-shard-00-01.70qps.mongodb.net:27017,cluster0-shard-00-02.70qps.mongodb.net:27017/ttnx?ssl=true&replicaSet=atlas-z7976o-shard-0&authSource=admin&retryWrites=true&w=majority",
  "mongodb://admin:admin@cluster0-shard-00-00-zzmbm.mongodb.net:27017,cluster0-shard-00-01-zzmbm.mongodb.net:27017,cluster0-shard-00-02-zzmbm.mongodb.net:27017/ttnx?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority",
];
mongoose.set("useFindAndModify", false);
mongoose
  .connect(mongoose_connections[5], {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((db) => console.log("Mongo connection successfull!"))
  .catch((err) => console.log(err));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Cors
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(passport.initialize());

app.use("/users", usersRouter);
app.use("/category", categoriesRouter);
app.use("/product", productsRouter);

//app.use(authenticate.verifyUser);
app.use("/profile", authenticate.verifyUser, profileRouter);
app.use("/admin", authenticate.verifyAdmin, adminRouter);
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
