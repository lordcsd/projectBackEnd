const express = require("express");
const router = express.Router();
const { AdminAuthGuard, TouristAuthGuard } = require("../middleware/check-auth");
const { PostTicket, GetTickets, DeleteTicket, UpdateTicket } = require('../controllers/ticket.controller')

const Ticket = require("../models/ticket");
const { body, query } = require("express-validator");
const { validateParams } = require("../middleware/validateParams");

router.get("/",
  query("_id").isMongoId().withMessage("_id: Must be a valid Mongoose _id").optional(),
  query("title").isString().withMessage("title: Must be a string").optional(),
  validateParams,
  GetTickets)

router.post("/",
  AdminAuthGuard,
  body('title').isString().withMessage('title must be a valid string'),
  body('desc').isString().withMessage('desc must be a valid string'),
  body('price').isNumeric().withMessage('price must be a valid number'),
  body('availability').isNumeric().withMessage('availability must be a valid number'),
  body('duration').isNumeric().withMessage('duration must be a valid number of days'),
  body('imageUrl').notEmpty().withMessage('imageUrl must not be empty'),
  validateParams,
  PostTicket);
  
//delete one ticket
router.delete("/delete",
  body("_id").isMongoId().withMessage('_id: Must be a valid mongoose _id'),
  AdminAuthGuard,
  DeleteTicket);

router.patch("/",
  query("_id").isMongoId().withMessage("_id: Must be a valid Mongoose _id"),
  body('title').isString().withMessage('title must be a valid string').optional(),
  body('desc').isString().withMessage('desc must be a valid string').optional(),
  body('price').isNumeric().withMessage('price must be a valid number').optional(),
  body('availability').isNumeric().withMessage('availability must be a valid number').optional(),
  body('duration').isNumeric().withMessage('duration must be a valid number of days').optional(),
  body('imageUrl').notEmpty().withMessage('imageUrl must not be empty').optional(),
  AdminAuthGuard,
  UpdateTicket);

module.exports = router;
