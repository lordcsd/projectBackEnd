const express = require('express')
const router = express.Router()

const Users = require("../models/user")
const Tickets = require("../models/ticket")
const Payments = require("../models/payments")

router.get(
    "/",
    async (req, res) => {
        const users = await Users.find().countDocuments()
        const tickets = await Tickets.find().countDocuments()
        const sold = await Payments.find().countDocuments()

        res.send({
            message: "Overview fetched",
            data: {
                "Registered Users": users,
                "Locations": tickets,
                "Tickets Sold": sold
            }
        })
    }
)

module.exports = router