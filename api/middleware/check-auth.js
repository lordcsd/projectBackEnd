const jwt = require("jsonwebtoken");
const user = require("../models/user");
const User = require("../models/user")

async function GeneralAuthGuard(req, res) {
  const token = req.headers.authorization.split(" ")[1]

  const decoded = jwt.decode(token, process.env.JWT_KEY);

  if (!decoded) { return res.status(401).json({ message: 'Unauthorized route' }) }

  const { _id, email } = decoded;

  const user = await User.findOne({ email })

  if (!user) { return res.status(401).json({ message: 'Unauthorized route' }) }

  req.user = { ...req.body, ...decoded }

  next()
}

async function AdminAuthGuard(req, res, next) {

  console.log(req.file)

  const token = req.headers.authorization.split(" ")[1]

  const decoded = jwt.decode(token, process.env.JWT_KEY);

  if (!decoded) { return res.status(401).json({ message: 'Unauthorized route' }) }

  const { _id, email } = decoded;

  const user = await User.findOne({ email })

  if (!user) { return res.status(401).json({ message: 'Unauthorized route' }) }

  req.user = decoded

  return user.isAdmin ? next() : res.status(401).json({ message: 'Unauthorized route' })
}

async function TouristAuthGuard(req, res, next) {
  const token = req.headers.authorization.split(" ")[1]

  const decoded = jwt.decode(token, process.env.JWT_KEY);

  if (!decoded) { return res.status(401).json({ message: 'Unauthorized route' }) }

  const { _id, email } = decoded;

  const user = await User.findOne({ email })

  if (!user) { return res.status(401).json({ message: 'Unauthorized route' }) }

  req.user = decoded
  return !user.isAdmin ? next() : res.status(401).json({ message: 'Unauthorized route' })
}

module.exports = { AdminAuthGuard, TouristAuthGuard, GeneralAuthGuard }


