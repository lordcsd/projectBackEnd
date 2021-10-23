let express = require("express");
let mongoose = require("mongoose");

let router = express.Router();
let Payment = require("../models/payments");

router.get("/", (req, res) => {
  Payment.find()
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        Payments: doc.map((each) => {
          return {
            id: each._id,
            title: each.title,
            date: each.time,
            userId: each.userId,
            price: each.price,
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
    title: req.body.title,
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
          title: result.title,
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
