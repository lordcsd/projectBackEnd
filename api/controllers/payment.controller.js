const Payment = require("../models/payments");
const crypto = require("crypto");

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

async function paystackWebhook(req, res) {
  const { body } = req;
  const signature = req.headers["x-paystack-signature"];
  const { PAYSTACK_SECRET } = process.env;
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (!signature) {
    console.log({ error: "signature was not provided", body });
    return res.status(422).json({ error: "signature was not provided" });
  }

  if (signature !== hash) {
    console.log({ error: "Invalid Hash", body });
    return res.status(406).json({ error: "Invalid Hash" });
  }

  console.log({ message: "Valid body", body });
}

async function checkout(req, res) {}

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
  checkout,
  paystackWebhook,
};
