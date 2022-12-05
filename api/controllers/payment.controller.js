const Payment = require("../models/payments");
const crypto = require("crypto");

async function getPayments(req, res) {
  const payments = await Payment.find()
    .select("_id  userId paid_at amount reference userCart")
    .exec();

  return res.send({
    count: payments.lenght,
    payments,
  });
}

async function getUserPayments(req, res) {
  const { userId } = req.params;

  const payments = await Payment.find({ userId }).select(
    "_id  userId paid_at amount reference userCart"
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

  const { event, data } = body;

  if (event == "charge.success") {
    const { amount, paid_at, reference, metadata } = data;
    const { userId, ticketIds } = metadata;

    console.log({ metadata });

    const paid = await new Payment({
      userId,
      paid_at: new Date(paid_at),
      amount,
      reference,
      ticketIds,
    }).save();

    return res.status(200).json({ message: "Transaction verified" });
  }

  return res.status(422).json({ error: "Invalid transaction" });
}

// {
//   amount: 103500,
//   paid_at: '2022-12-05T14:34:55.000Z',
//   reference: 'T491246059456135',
//   metadata: {
//     name: 'Chinonso Dimgba',
//     userId: '638dd9b43cb9152d3881e0b0',
//     userCart: [{_id: "",title: "title",  }]
//     referrer: 'https://tourist-app.cyclic.app/dashboard'
//   },
//   customer: {
//     id: 104705060,
//     first_name: '',
//     last_name: '',
//     email: 'dimgbachinonso@gmail.com',
//     customer_code: 'CUS_j8wju09bhb1ezp2',
//     phone: '',
//     metadata: null,
//     risk_action: 'default',
//     international_format_phone: null
//   }
// }

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
  paystackWebhook,
};
