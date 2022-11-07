let express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { join } = require('path')
const ticketRoutes = require("./api/routes/tickets");
const userRoutes = require("./api/routes/users");
const paymentRoutes = require("./api/routes/payments");
const userNotificationsRoutes = require("./api/routes/userNotifications");

const atlas = `mongodb+srv://lordcsd:${process.env.MONGO_ATLAS_PW}@firstrestfulapi.ms2k2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// let mongodbLocalURL = `mongodb://127.0.0.1:27017/`;

mongoose.connect(atlas, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
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

// app.use(express.static('client'))
app.use('/static', express.static(join(__dirname, '/client//static')));
app.get('*', function(req, res) {
  res.sendFile('index.html', {root: join(__dirname, '/client/')});
});

app.use("/uploads", express.static("api/uploads"));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// app.get("/", (req, res) => {
//   res.sendFile(join(__dirname, "client", "index.html"));
// });

app.use("/api/tickets", ticketRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/userNotifications", userNotificationsRoutes);

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
