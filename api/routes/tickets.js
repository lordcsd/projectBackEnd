const express = require("express");
const router = express.Router();
const imageToBase64 = require("image-to-base64");
const multer = require("multer");
let rimraf = require("rimraf");
const fs = require("fs");
const checkAuth = require("../middleware/check-auth");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./api/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

let mongoose = require("mongoose");
const Ticket = require("../models/ticket");

router.get("/", (req, res) => {
  Ticket.find()
    .select("title desc price _id price duration availability imageUrl")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        tickets: doc.map((each) => {
          return {
            _id: each._id,
            title: each.title,
            desc: each.desc,
            price: each.price,
            duration: each.duration,
            imageUrl: each.imageUrl,
            availability: each.availability,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    });
});

router.post("/", checkAuth, (req, res, next) => {
  //check if ticket with title already exist
  Ticket.find({ title: req.body.title })
    .exec()
    .then((result) => {
      if (result.length > 0) {
        res.status(409).json({ message: "Ticket with title already exists" });
      } else {
        let ticket = new Ticket({
          _id: new mongoose.Types.ObjectId(),
          title: req.body.title,
          desc: req.body.desc,
          price: req.body.price,
          availability: req.body.availability,
          duration: req.body.duration,
          date: new Date().toISOString(),
          imageUrl: req.body.imageUrl,
        });
        ticket
          .save()
          .then((result) => {
            res.status(200).json({ result });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
          });
      }
    })
    .catch();
});

//get one ticket
router.get("/getOne", (req, res) => {
  let id = req.body.ticketId;
  Ticket.findById(id)
    .exec()
    .then((doc) => {
      res.status(200).json(doc);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//delete one ticket
router.post("/delete", checkAuth, (req, res) => {
  let _id = req.body.ticketId;
  Ticket.deleteOne({ _id: _id })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/", checkAuth, (req, res) => {
  let updateOps = {
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    availability: req.body.availability,
    duration: req.body.duration,
    imageUrl: req.body.imageUrl,
  };

  console.log(Object.getOwnPropertyNames(req.body))

  Ticket.updateOne({ _id: req.body._id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({ message: updateOps });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "update Failed",
        error: err,
      });
    });
});

module.exports = router;
