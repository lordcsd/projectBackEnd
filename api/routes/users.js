const express = require("express");
const router = express.Router();

let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");

router.get("/", (req, res) => {
  User.find()
    .select("_id name age gender activeTickets")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        Users: doc.map((each) => {
          return {
            _id: each._id,
            name: each.name,
            gender: each.gender,
            age: each.age,
            activeTickets: each.activeTickets,
          };
        }),
      };
      console.log("Users Fetched:", response);
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err,
      });
    });
});

router.post("/signup", (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((users) => {
      if (users.length >= 1) {
        res.status(409).json({
          message: "email already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (hash) {
            let user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              email: req.body.email,
              age: req.body.age,
              gender: req.body.gender,
              password: hash,
              phone: req.body.phone,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "User posted",
                  createdUser: {
                    _id: result._id,
                    name: result.name,
                    email: result.email,
                    phone: result.phone,
                    password: result.password,
                    age: result.age,
                    gender: result.gender,
                    activeTickets: result.activeTickets,
                    notificattions: result.notificattions,
                  },
                });
              })
              .catch((signUpErr) => {
                console.log(signUpErr);
              });
          }
          if (err) {
            return res.status(500).json({
              error: err,
            });
          }
        });
      }
    });
});

router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  User.find({ email: email })
    .select("_id name email phone password activeTickets notifications")
    .exec()
    .then((doc) => {
      if (doc.length < 1) {
        return res.status(404).json({ message: "Auth failed" });
      }
      bcrypt.compare(password, doc[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({ message: "Auth failed" });
        }
        if (result) {
          let returned = {
            _id: doc[0]._id,
            name: doc[0].name,
            email: doc[0].email,
            activeTickets: doc[0].activeTickets,
            notifications: doc[0].notifications,
          };
          const token = jwt.sign(returned, process.env.JWT_KEY, {
            expiresIn: "1h",
          });
          return res.status(200).json({
            message: "Auth successful",
            email: req.body.email,
            token: token,
          });
        }
        res.status(401).json({ message: "Auth failed" });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//after login, get user files
//takes header auth token and body.email
router.post("/getUserDetails", checkAuth, (req, res) => {
  let email = req.body.email;
  User.find({ email: email })
    .select(
      "_id name email phone password gender age activeTickets notifications"
    )
    .exec()
    .then((doc) => {
      let returned = {
        _id: doc[0]._id,
        name: doc[0].name,
        email: doc[0].email,
        phone: doc[0].phone,
        gender: doc[0].gender,
        age: doc[0].age,
        activeTickets: doc[0].activeTickets,
        notifications: doc[0].notifications,
      };
      return res.status(200).json(returned);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//takes params.password and body.email, and header.authorization
router.post("/delete", checkAuth, (req, res) => {
  let password = req.body.password;
  let email = req.body.email;
  User.find({ email: email })
    .exec()
    .then((doc) => {
      if (doc.length > 0) {
        bcrypt.compare(password, doc[0].password, (err, result) => {
          if (result) {
            User.deleteOne({ email: email })
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
          } else {
            console.log("Invalid password");
            res.status(422).json({
              message: "invalid password",
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

//post new tickect
router.post("/addUserTickets", (req, res) => {
  let _id = req.body._id;
  let ticket = {
    title: req.body.title,
    desc: req.body.desc,
    price: req.body.price,//number
    duration: req.body.duration,//number in days
    imageUrl: req.body.imageUrl,
    date: req.body.date,//string
  };
  User.updateOne({ _id: _id }, { $push: { activeTickets: ticket } })
    .exec()
    .then((answer) => res.status(200).json(answer))
    .catch((err) => res.send(err));
});

//takes body.password and body.email and header.authorization
router.patch("/", checkAuth, (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  let newPassword = req.body.newPassword;
  User.find({ email: email })
    .exec()
    .then((doc) => {
      bcrypt.compare(password, doc[0].password, (result, err) => {
        let updateOps = {};
        if (result) {
          let reqProps = Object.getOwnPropertyNames(req.body);
          reqProps.forEach((each) => {
            updateOps[each] = req.body[each];
          });
          updateOps = { ...updateOps, password: newPassword };
        }

        let hashed = new Promise((resolve, reject) => {
          bcrypt.hash(newPassword, 10, (err, hash) => {
            if (err) {
              return res.status(500).json({
                error: err,
              });
            }
            if (hash) {
              resolve(hash);
            }
          });
        });

        hashed
          .then((hash) => {
            console.log(hash);
            updateOps = { ...updateOps, password: hash };

            User.updateOne({ email: email }, { $set: updateOps })
              .exec()
              .then((result) => {
                console.log("result: ", result);
                res.status(200).json(result);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          })
          .catch((err) => console.log(err));
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
