const express = require("express");
const router = express.Router();
const multer = require("multer");
let rimraf = require("rimraf");
const fs = require("fs");
const { AdminAuthGuard, TouristAuthGuard } = require("../middleware/check-auth");
const { PostTicket } = require('../controllers/ticket.controller')

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
const { body } = require("express-validator");
const { validateParams } = require("../middleware/validateParams");

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

router.post("/",
  AdminAuthGuard,
  body('title').isString().withMessage('title must be a valid string'),
  body('desc').isString().withMessage('desc must be a valid string'),
  body('price').isNumeric().withMessage('price must be a valid number'),
  body('availability').isNumeric().withMessage('availability must be a valid number'),
  body('duration').isNumeric().withMessage('duration must be a valid number of days'),
  body('imageUrl').notEmpty().withMessage('imageUrl must not be empty'),
  validateParams,
  PostTicket);

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
router.post("/delete", AdminAuthGuard, (req, res) => {
  console.log(req.body)
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

router.patch("/", AdminAuthGuard, (req, res) => {
  let updateOps = {
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    availability: req.body.availability,
    duration: req.body.duration,
    imageUrl: req.body.imageUrl,
  };

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
