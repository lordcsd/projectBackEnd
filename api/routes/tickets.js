const express = require("express");
const router = express.Router();
const multer = require("multer");
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

router.post("/", upload.single("imageUrl"), (req, res, next) => {
  let ticket = new Ticket({
    _id: new mongoose.Types.ObjectId(),
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,
    availability: req.body.availability,
    duration: req.body.duration,
    date: req.body.date,
    imageUrl: req.file ? "/uploads/" + req.file.filename : "",
  });
  console.log(req.file);
  ticket
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Ticket posted",
        createdTicket: {
          _id: result.id,
          title: result.title,
          desc: result.desc,
          price: result.price,
          duration: result.duration,
          availability: result.availability,
          date: result.date,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
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
router.post("/delete", (req, res) => {
  let _id = req.body.ticketId;
  let imageUrl = "";
  Ticket.find({ _id: _id })
    .select("imageUrl")
    .then((doc) => {
      if (doc.length > 0) {
        if (doc[0].imageUrl != "") {
          imageUrl = "api" + doc[0].imageUrl;
          fs.unlinkSync(imageUrl, (err) => {
            err ? console.log(err) : null;
          });
        }
      }
    })
    .catch((err) => console.log(err));

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

router.patch("/", checkAuth, upload.single("imageUrl"), (req, res) => {
  const _id = req.body._id;
  const updateOps = {};
  let reqProps = Object.getOwnPropertyNames(req.body);
  reqProps.forEach((each) => {
    updateOps[each] = req.body[each];
  });

  if (req.file) {
    updateOps.imageUrl = req.file ? "/uploads/" + req.file.filename : "";
    let deleteImageUrl = "";
    Ticket.find({ _id: _id })
      .select("imageUrl")
      .then((doc) => {
        if (doc.length > 0) {
          if (doc[0].deleteImageUrl != "") {
            deleteImageUrl = "api" + doc[0].imageUrl;
            fs.unlinkSync(deleteImageUrl, (err) => {
              err ? console.log(err) : null;
            });
          }
        }
      })
      .catch((err) => console.log(err));
  }

  Ticket.updateOne({ _id: _id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
