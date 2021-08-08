const express = require("express");
const router = express.Router();

let mongoose = require("mongoose");
let bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/check-auth");

const User = require("../models/user");
const Payment = require("../models/payments");

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
            _id: doc[0]._id,
            token: token,
          });
        } else {
          res.status(401).json({ message: "Auth failed" });
        }
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
router.post("/addUserTickets", checkAuth, (req, res) => {
  let activeTickets = [];
  let payments = [];

  let existingTicktes = [];

  User.find({ _id: req.body._id })
    .exec()
    .then((doc) => {
      doc[0].activeTickets.forEach((e) => {
        existingTicktes.push(e.title);
      });

      console.log("doc: ",doc)

      for (var key in req.body.data) {
        activeTickets.push({
          title: req.body.data[key].title,
          price: req.body.data[key].price,
          duration: req.body.data[key].duration,
          time: new Date(),
        });

        payments.push({
          title: req.body.data[key].title,
          duration: req.body.data[key].duration,
          userId: req.body.data[key].userId,
          time: new Date().toISOString(),
          price: req.body.data[key].totalPrice,
        });
      }

      let coliding = [];
      activeTickets.forEach((e) => {
        if (existingTicktes.includes(e.title)) {
          coliding.push(e.title);
        }
      });

      if (coliding.length > 0) {
        res.status(200).json({
          message: `Tickets for ${coliding.toString()} have already been bought by You!`,
        });
      } else {
        User.updateOne(
          { _id: req.body._id },
          {
            $push: {
              activeTickets: { $each: activeTickets },
            },
          }
        )
          .exec()
          .then((answer) => {
            Payment.insertMany(payments, (error, doc) => {
              if (error) console.log(error);
              if (doc) console.log(doc);
            });
          })
          .catch((err) => res.send(err));
      }
    })
    .catch((err) => console.log(err));
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
