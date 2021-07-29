let express = require("express");
const router = express.Router();
const AdminNotification = require("../models/adminNotification");

router.post("/", (req, res) => {
  let adminNotification = new AdminNotification({
    userId: req.body.userId,
    title: req.body.title,
    desc: req.body.desc,
  });
  adminNotification
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "admin notification created",
        createdAdmindNotification: {
          _id: result._id,
          userId: result.userId,
          title: result.title,
          desc: result.desc,
        },
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/:userId", (req, res) => {
  let userId = req.params.userId;
  AdminNotification.find({ userId: userId })
    .select("_id title desc")
    .exec()
    .then((doc) => {
      let response = {
        count: doc.length,
        adminNotifications: doc.map((each) => {
          return {
            _id: each._id,
            title: each.title,
            desc: each.desc,
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

router.delete('/:_id',(req,res)=>{
  let notificationId = req.params._id;
  AdminNotification.remove({_id:notificationId}).exec().then(()=>{
    console.log("notification removed");
    res.status(200).json({message:'Notification Removed'})
  }).catch(err=>{
    console.log(err);
    res.status(500).json({message:'removal failed'})
  });

})

module.exports = router;
