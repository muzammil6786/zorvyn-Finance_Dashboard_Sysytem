const Joi = require("joi");
const { TRANSACTION_TYPES, CATEGORIES } = require("../config/constants");
const { validate } = require("./userValidator");

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)).required(),
  category: Joi.string().valid(...CATEGORIES).required(),
  date: Joi.date().iso().max("now").default(() => new Date()),
  description: Joi.string().trim().max(500).allow("", null),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().precision(2),
  type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)),
  category: Joi.string().valid(...CATEGORIES),
  date: Joi.date().iso().max("now"),
  description: Joi.string().trim().max(500).allow("", null),
}).min(1);

const transactionQuerySchema = Joi.object({
  type: Joi.string().valid(...Object.values(TRANSACTION_TYPES)),
  category: Joi.string().valid(...CATEGORIES),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid("date", "amount", "createdAt").default("date"),
  order: Joi.string().valid("asc", "desc").default("desc"),
});

const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
  if (error) {
    return res.status(422).json({
      success: false,
      message: "Invalid query parameters",
      errors: error.details.map((d) => d.message),
    });
  }
  req.query = value;
  next();
};

module.exports = {
  validateCreateTransaction: validate(createTransactionSchema),
  validateUpdateTransaction: validate(updateTransactionSchema),
  validateTransactionQuery: validateQuery(transactionQuerySchema),
};
