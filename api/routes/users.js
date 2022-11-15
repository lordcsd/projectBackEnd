const express = require("express");
const router = express.Router();
const { TouristAuthGuard, GeneralAuthGuard } = require("../middleware/check-auth");
const { validateParams } = require("../middleware/validateParams");
const { signUp, login, updateUserDetails, getAllUsers, deleteAccount, adminSignUp } = require("../controllers/user.controller");

const { body } = require('express-validator');

router.get("/", getAllUsers);

router.post("/signup",
    body('email').isEmail().withMessage('email: Must be a valid email address'),
    body('name').isString().withMessage('name: Must be a string'),
    body('age').isNumeric().withMessage('age: Must be a number'),
    body('gender').isIn(['Male', 'Female']).withMessage('gender: Must be Male or Female'),
    body('phone').isMobilePhone().withMessage('phone: Must be a valid phone number'),
    body('password')
        .isLength({ min: 8 }).withMessage('password: must have at least 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('password: must contain at least one lowercase alphabet')
        .matches(/(?=.*[A-Z])/).withMessage('password: must contain at least one uppercase alphabet')
        .matches(/(?=.*[0-9])/).withMessage('password: must contain at least one number')
        .matches(/\W|_/).withMessage('password: must contain at least one special character'),

    validateParams,
    signUp);

router.post("/admin-signup",
    body('email').isEmail().withMessage('email: Must be a valid email address'),
    body('name').isString().withMessage('name: Must be a string'),
    body('firm').isString().withMessage('firm: Must be a string'),
    body('age').isNumeric().withMessage('age: Must be a number'),
    body('gender').isIn(['Male', 'Female']).withMessage('gender: Must be Male or Female'),
    body('phone').isMobilePhone().withMessage('phone: Must be a valid phone number'),
    body('password')
        .isLength({ min: 8 }).withMessage('password: must have at least 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('password: must contain at least one lowercase alphabet')
        .matches(/(?=.*[A-Z])/).withMessage('password: must contain at least one uppercase alphabet')
        .matches(/(?=.*[0-9])/).withMessage('password: must contain at least one number')
        .matches(/\W|_/).withMessage('password: must contain at least one special character'),
    validateParams,
    adminSignUp);

router.post("/login",
    body('email').isEmail().withMessage('email: Must be a valid email address'),
    body('password')
        .isLength({ min: 8 }).withMessage('password: must have at least 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('password: must contain at least one lowercase alphabet')
        .matches(/(?=.*[A-Z])/).withMessage('password: must contain at least one uppercase alphabet')
        .matches(/(?=.*[0-9])/).withMessage('password: must contain at least one number')
        .matches(/\W|_/).withMessage('password: must contain at least one special character'),
    validateParams,
    login);

//takes params.password and body.email, and header.authorization
router.post("/delete", TouristAuthGuard, deleteAccount);

//takes body.password and body.email and header.authorization
router.patch("/", GeneralAuthGuard,
    body('name').isString().withMessage('name: Must be a string').optional(),
    body('age').isNumeric().withMessage('age: Must be a number').optional(),
    body('phone').isMobilePhone().withMessage('phone: Must be a valid phone number').optional(),
    body('oldPassword')
        .isLength({ min: 8 }).withMessage('oldPassword: must have at least 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('oldPassword: must contain at least one lowercase alphabet')
        .matches(/(?=.*[A-Z])/).withMessage('oldPassword: must contain at least one uppercase alphabet')
        .matches(/(?=.*[0-9])/).withMessage('oldPassword: must contain at least one number')
        .matches(/\W|_/).withMessage('oldPassword: must contain at least one special character')
        .optional(),
    body('newPassword')
        .isLength({ min: 8 }).withMessage('newPassword: must have at least 8 characters')
        .matches(/(?=.*[a-z])/).withMessage('newPassword: must contain at least one lowercase alphabet')
        .matches(/(?=.*[A-Z])/).withMessage('newPassword: must contain at least one uppercase alphabet')
        .matches(/(?=.*[0-9])/).withMessage('newPassword: must contain at least one number')
        .matches(/\W|_/).withMessage('newPassword: must contain at least one special character')
        .optional(),
    validateParams,
    updateUserDetails);

module.exports = router;
