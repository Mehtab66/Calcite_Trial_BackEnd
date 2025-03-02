require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var connectDB = require("./Config/db.config");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var reviewRouter = require("./routes/Review");
var cors = require("cors");
var app = express();
connectDB();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  next();
});
// const corsOptions = {
//   origin: "https://calcite-trial-frontend.onrender.com/", // Frontend origin
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
// };
// app.use(cors(corsOptions));
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = ["https://calcite-trial-frontend.onrender.com"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control"],
};
app.use(cors(corsOptions));
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/review", reviewRouter);
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
