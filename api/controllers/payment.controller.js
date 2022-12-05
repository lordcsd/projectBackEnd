let Payment = require("../models/payments");

async function getPayments(req, res) {
  const payments = await Payment.find()
    .select("_id title time userId price")
    .exec();

  return res.send({
    count: payments.lenght,
    payments,
  });
}

async function getUserPayments(req, res) {
  const { userId } = req.params;

  const payments = await Payment.find({ userId }).select(
    "_id userId time amount"
  );

  return res.send({
    count: payments.lenght,
    payments,
  });
}

async function checkout(req,res){

}

// (req, res) => {
//     let payment = new Payment({
//       title: req.body.title,
//       userId: req.body.userId,
//       time: req.body.time,
//       amount: req.body.amount,
//     });
//     payment
//       .save()
//       .then((result) => {
//         res.status(200).json({
//           message: "payment made",
//           createdUser: {
//             title: result.title,
//             userId: result.userId,
//             time: result.time,
//             amount: result.amount,
//           },
//         });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

module.exports = {
  getPayments,
  getUserPayments,
  checkout
};
