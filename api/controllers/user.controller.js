const User = require("../models/user")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

async function signUp(req, res) {
    const { email, name, age, gender, phone, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        return res.status(409).json({ message: "User with same email already exist" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, age, gender, password: hashedPassword, phone })
    const createdUser = await newUser.save()
    delete createdUser["_doc"].password
    return res.status(201).json({ message: "User Created", data: createdUser['_doc'] })
}

async function adminSignUp(req, res) {
    const { email, name, age, gender, phone, password, firm } = req.body
    const user = await User.findOne({ email })
    if (user) {
        return res.status(409).json({ message: "User with same email already exist" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ name, email, age, gender, password: hashedPassword, phone, firm, isAdmin: true })
    const createdUser = await newUser.save()
    delete createdUser["_doc"].password
    return res.status(201).json({ message: "User Created", data: createdUser['_doc'] })
}

async function login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email })
        .select("_id name email password activeTickets notifications isAdmin")

    if (!user) {
        return res.status(401).json({ message: "Invalid Details" })
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
        return res.status(401).json({ message: "Invalid Details" })
    }

    delete user['_doc'].password

    const token = jwt.sign(user['_doc'], process.env.JWT_KEY, {
        expiresIn: "1h",
    })

    return res.status(200).json({
        message: "Auth successful", token, ...user['_doc']
    });
}

async function getAllUsers(req, res) {
    const users = await User.find()
        .select("_id name age gender activeTickets")
    return res.send({ message: 'Users fetched', data: users })
}

async function deleteAccount(req, res) {
    const { _id } = req.user;
    await User.deleteOne({ _id })
    return res.send({ message: ' User Account removed' })
}

async function updateUserDetails(req, res) {
    const { email } = req.user;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(401).json({ message: 'Invalid User' })
    }

    const { newPassword, oldPassword } = req.body

    if (!oldPassword) {
        return res.status(401).json({ message: 'Please provide oldPassword' })
    }

    const oldPasswordValid = await bcrypt.compare(oldPassword, user.password)

    if (!oldPasswordValid) {
        return res.status(401).json({ message: 'oldPassword does not match account' })
    }

    if (newPassword) {
        req.body.password = await bcrypt.hash(newPassword, 10)
    }

    const validFields = ['name', 'password', 'phone', 'age'];
    Object.keys(req.body).forEach((key, index) => {
        if (!validFields.includes(key)) {
            delete req.body[key]
        }
    })

    const updatedUser = await User.updateOne({ email: email }, req.body)

    return res.status(200).json({ message: 'Details Updated', data: updatedUser });
}


module.exports = { signUp, adminSignUp, login, updateUserDetails, getAllUsers, deleteAccount }
