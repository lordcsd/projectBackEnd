let express = require("express");
let mongoose = require("mongoose");

const router = express.Router();
const UserNotification = require("../models/userNotification");
const User = require("../models/user");

router.post("/", (req, res) => {
  let testNotif = [
    { title: "this is the title", desc: "this is the desc" },
    { title: "this is the title", desc: "this is the desc" },
    { title: "this is the title", desc: "this is the desc" },
    { title: "this is the title", desc: "this is the desc" },
    { title: "this is the title", desc: "this is the desc" },
    { title: "this is the title", desc: "this is the desc" },
  ];
  // User.find()
  //   .select("_id name notifications")
  //   .then((doc) => {
  //     res.status(201).json(doc);
  //   })
  //   .catch((err) => res.status(422).json({ error: err }));
  User.updateOne({ notifications:["rice"] }, { $set: ["yam"] })
    .exec()
    .then(res=>res.status(201).json(res))
    .catch(err=>res.status(409).json(err));
});

router.get("/", (req, res) => {
  User.find()
    .select("_id name notifications")
    .then((doc) => {
      res.status(201).json(doc);
    })
    .catch((err) => res.status(409).json({ error: err }));
})

// router.post("/", (req, res) => {
//   let userNotification = new UserNotification({
//     userId: req.body.userId,
//     title: req.body.title,
//     desc: req.body.desc,
//   });
//   userNotification
//     .save()
//     .then((result) => {
//       console.log(result);
//       res.status(200).json({
//         message: "user notification created",
//         createdUserNotification: {
//           _id: result._id,
//           adminId: result.userId,
//           title: result.title,
//           desc: result.desc,
//         },
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

// router.get("/:userId", (req, res) => {
//   let userId = req.params.userId;
//   UserNotification.find({ userId: userId })
//     .select("_id title desc")
//     .exec()
//     .then((doc) => {
//       let response = {
//         count: doc.length,
//         userNotifications: doc.map((each) => {
//           return {
//             _id: each._id,
//             title: each.title,
//             desc: each.desc,
//           };
//         }),
//       };
//       res.status(200).json(response);
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({ error: err });
//     });
// });

// router.delete('/:_id',(req,res)=>{
//   let notificationId = req.params._id;
//   UserNotification.remove({_id:notificationId}).exec().then(()=>{
//     console.log("notification removed");
//     res.status(200).json({message:'Notification Removed'})
//   }).catch(err=>{
//     console.log(err);
//     res.status(500).json({message:'removal failed'})
//   });

// })

module.exports = router;
