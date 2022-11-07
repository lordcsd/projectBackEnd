const Ticket = require("../models/ticket")

async function PostTicket(req, res) {
    const { title, desc, price, availability, duration, imageUrl } = req.body

    const marchingTicket = await Ticket.findOne({ title })

    if (marchingTicket) {
        return res.status(409).json({ message: "Ticket with title already exists" })
    }

    const ticket = new Ticket({
        title,
        desc,
        price: +price,
        availability: +availability,
        duration: +duration,
        date: new Date().toISOString(),
        imageUrl
    })

    await ticket.save();

    return res.status(200).json({ message: 'ticket created' });
}

module.exports = { PostTicket }