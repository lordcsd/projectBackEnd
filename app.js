let express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const ticketRoutes = require("./api/routes/tickets");
const userRoutes = require("./api/routes/users");
const adminRoutes = require("./api/routes/admins");
const paymentRoutes = require("./api/routes/payments");
const adminNotificationsRoutes = require("./api/routes/adminNotifications");
const userNotificationsRoutes = require("./api/routes/userNotifications");

const mongodbURL = `mongodb+srv://lordcsd:${process.env.MONGO_ATLAS_PW}@firstrestfulapi.ms2k2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
let mongodbLocalURL = `mongodb://127.0.0.1:27017/`;

mongoose.connect(mongodbLocalURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Accept,Authorization"
  );
  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT,POST,PATCH,DELETE");
  }
  next();
});

app.use("/uploads", express.static("api/uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/tickets", ticketRoutes);
app.use("/users", userRoutes);
app.use("/admins", adminRoutes);
app.use("/payments", paymentRoutes);
app.use("/adminNotifications", adminNotificationsRoutes);
app.use("/userNotifications", userNotificationsRoutes);

app.use((req, res, next) => {
  let error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
