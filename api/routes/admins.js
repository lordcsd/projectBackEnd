const express = require("express");
const router = express.Router();

const Admin = require("../models/admin");
const SecretKeySchema = require("../models/secretKeySchema");

const checkAuth = require("../middleware/check-auth");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

router.get("/", (req, res) => {
  Admin.find()
    .select("name")
    .exec()
    .then((doc) => {
      const response = {
        count: doc.length,
        Admins: doc.map((each) => {
          return {
            name: each.name,
          };
        }),
      };
      console.log("Admins Fetched:", response);
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
  Admin.find({ email: req.body.email })
    .exec()
    .then((admins) => {
      if (admins.length >= 1) {
        res.status(409).json({
          message: "email already exists",
        });
      } else {
        console.log(req.body.secretKey);
        SecretKeySchema.find({ _id: req.body.secretKey })
          .exec()
          .then((doc) => {
            if (doc.length == 0) {
              res
                .status(404)
                .json({ message: "No matching Secret Key Found!" });
            } else if (doc.length > 0 && !doc[0].taken) {
              bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (hash) {
                  let admin = new Admin({
                    name: req.body.name,
                    email: req.body.email,
                    password: hash,
                    phone: req.body.phone,
                    firm: req.body.firm,
                  });
                  admin
                    .save()
                    .then((result) => {
                      SecretKeySchema.updateOne(
                        { _id: req.body.secretKey },
                        { $set: { taken: true } }
                      )
                        .then((secretKeyUpdated) => {
                          res.status(201).json({
                            message: "Admin signed In",
                            secretKeyTaken: secretKeyUpdated,
                            createdAdmin: {
                              _id: result._id,
                              name: result.name,
                              email: result.email,
                              phone: result.phone,
                              password: result.password,
                            },
                          });
                        })
                        .catch((secretKeyError) => {
                          res.status(501).json({
                            message: "Error taking secret Key",
                            error: secretKeyError,
                          });
                        });
                    })
                    .catch((signUpErr) => {
                      res.status(503).json({
                        message: "Error signing up",
                        error: signUpErr,
                      });
                    });
                }
                if (err) {
                  return res.send({
                    error: err,
                  });
                }
              });
            } else if (doc.length == 1 && doc[0].taken == true) {
              console.log(doc);
              res.send({ message: "secretKeyAlready Taken" });
            }
          })
          .catch((err) => {
            res.status(401).json({ message: "invalid secretKey", error: err });
          });
      }
    })
    .catch((err) => res.send(err));
});

router.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  Admin.find({ email: email })
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
            phone: doc[0].phone,
            activeTickets: doc[0].activeTickets,
            notifications: doc[0].notifications,
          };
          const token = jwt.sign(returned, process.env.JWT_KEY, {
            expiresIn: "1h",
          });
          return res.status(200).json({ email: req.body.email, token: token });
        }
        res.status(401).json({ message: "Auth failed" });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

//after login, get Admin files
//takes header auth token and body.email
router.post("/getAdminDetails", checkAuth, (req, res) => {
  let email = req.body.email;
  Admin.find({ email: email })
    .select("_id name email phone password firm")
    .exec()
    .then((doc) => {
      let returned = {
        _id: doc[0]._id,
        name: doc[0].name,
        email: doc[0].email,
        phone: doc[0].phone,
        firm: doc[0].firm,
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
  Admin.find({ email: email })
    .exec()
    .then((doc) => {
      if (doc.length > 0) {
        bcrypt.compare(password, doc[0].password, (err, result) => {
          if (result) {
            Admin.remove({ email: email })
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

//takes body.password and params.email and header.authorization
router.patch("/update", checkAuth, (req, res) => {
  const password = req.body.password;
  let newPassword = req.body.newPassword;
  const email = req.body.email;
  Admin.find({ email: email })
    .exec()
    .then((doc) => {
      bcrypt.compare(password, doc[0].password, async (err, result) => {
        let updateOps = {};
        if (result) {
          let reqProps = Object.getOwnPropertyNames(req.body);
          reqProps.forEach((each) => {
            updateOps[each] = req.body[each];
          });
          updateOps = { ...updateOps, password: newPassword };
        }

        let hashed = new Promise((resolve, reject) => {
          if (req.body.password) {
            bcrypt.hash(newPassword, 10, (err, hash) => {
              if (err) {
                return res.status(500).json({
                  error: err,
                });
              } else {
                resolve(hash);
              }
            });
          }
        });

        hashed
          .then((hash) => {
            updateOps = { ...updateOps, password: hash };

            Admin.updateOne({ email: email }, { $set: updateOps })
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
          })
          .catch((passErr) => console.log(passErr));
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
