let express = require("express");
const {
  getPayments,
  getUserPayments,
} = require("../controllers/payment.controller");

let router = express.Router();

router.get("/", getPayments);

router.get("/:userId", getUserPayments);

router.post('/checkout', )

router.post("/paystack-webhook",);

module.exports = router;
