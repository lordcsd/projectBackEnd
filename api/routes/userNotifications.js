let express = require("express");
let mongoose = require("mongoose");

const router = express.Router();
const User = require("../models/user");
const SecretKeySchema = require("../models/secretKeySchema");

// router.post("/addKeys", (req, res) => {
//   let secretKey = new SecretKeySchema({
//     taken: false,
//   });

//   secretKey
//     .save()
//     .then((result) => res.send(result))
//     .catch((err) => res.send(err));
// });

router.patch("/send", (req, res) => {
  let update = { title: req.body.title, body: req.body.body };
  let updater = (id) => {
    if (id) {
      User.find({ _id: id })
        .exec()
        .then((doc) => {
          if (doc.length > 0) {
            User.updateOne({ _id: id }, { $push: { notifications: update } })
              .exec()
              .then((result) => res.status(200).json(result))
              .catch((err) => res.send(err));
          } else {
            res.status(422).json({ message: "Invalid _id" });
          }
        })
        .catch((err) => res.send(err));
    } else {
      User.updateMany(
        { typeOfUser: "cyberTourUser" },
        { $push: { notifications: update } }
      )
        .exec()
        .then((result) => res.status(200).json(result))
        .catch((err) => res.send(err));
    }
  };
  updater(req.body._id);
});

router.patch("/removeOne", (req, res) => {
  let _id = req.body._id;
  let sent = { title: req.body.title, body: req.body.body };
  console.log(req.body);
  User.updateOne({ _id: _id }, { $pull: { notifications: sent } })
    .exec()
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(422).json({ error: err, from: "findOneAndUpdate" })
    );
});

module.exports = router;
