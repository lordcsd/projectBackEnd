const Payment = require("../models/payments");
const Ticket = require("../models/ticket");
const crypto = require("crypto");

async function getPayments(req, res) {
  const payments = await Payment.find()
    .select("_id  userId paid_at amount reference userCart ticketIds")
    .exec();

  return res.send({
    count: payments.lenght,
    payments,
  });
}

async function getUserPayments(req, res) {
  const { userId } = req.params;

  const payments = await Payment.find({ userId }).select(
    "_id  userId paid_at amount reference userCart ticketIds"
  );

  for (const i in payments) {
    const tickets = await Ticket.find({
      _id: { $in: payments[i].ticketIds },
    });
    payments[i]['_doc'] = { ...payments[i]['_doc'], tickets };
  }

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

module.exports = {
  getPayments,
  getUserPayments,
  paystackWebhook,
};
