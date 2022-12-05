let express = require("express");
const {
  getPayments,
  getUserPayments,
  paystackWebhook,
} = require("../controllers/payment.controller");

let router = express.Router();

router.get("/", getPayments);

router.get("/:userId", getUserPayments);

router.post("/paystack-webhook", paystackWebhook);

module.exports = router;
