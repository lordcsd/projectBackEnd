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

async function GetTickets(req, res) {
    const { _id, title } = req.query
    const tickets = await Ticket.find({
        ..._id && { _id },
        ...title && { title },
    })
        .select("title desc price _id price duration availability imageUrl")
    return res.send({ message: "Tickets Fetched", data: { tickets } })
}

async function DeleteTicket(req, res) {
    const { _id } = req.body;
    await Ticket.delete({ _id })
    return res.send({ message: "Ticket deleted" })
}

async function UpdateTicket(req, res) {
    const { title, desc, price, availability, duration, imageUrl } = req.body
    const updateOps = { title, desc, price, availability, duration, imageUrl }
    await Ticket.updateOne({ _id: req.body._id }, updateOps)
    return res.send({ message: 'Ticker Updated', data: updateOps })
}

module.exports = { PostTicket, GetTickets, DeleteTicket, UpdateTicket }