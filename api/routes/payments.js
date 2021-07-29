let express = require("express");
let mongoose = require("mongoose");

let router = express.Router();
let Payment = require("../models/payments");

router.get("/", (req, res) => {
  Payment.find()
    .select("id userId time amount")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        Payments: doc.map((each) => {
          return {
            _id: each._id,
            userId: each.userId,
            time: each.time,
            amount: each.amount,
          };
        }),
      };
      console.log("payments:", response);
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    });
});

router.get("/:userId", (req, res) => {
  let userId = req.params.userId;
  Payment.find({ userId: userId })
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        Payments: doc.map((each) => {
          return {
            userId: each.userId,
            time: each.time,
            amount: each.amount,
          };
        }),
      };
      console.log(response);
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    });
});

router.post("/", (req, res) => {
  let payment = new Payment({
    _id: new mongoose.Types.ObjectId(),
    userId: req.body.userId,
    time: req.body.time,
    amount: req.body.amount,
  });
  payment
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "payment made",
        createdUser: {
          _id: result._id,
          userId: result.userId,
          time: result.time,
          amount: result.amount,
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
