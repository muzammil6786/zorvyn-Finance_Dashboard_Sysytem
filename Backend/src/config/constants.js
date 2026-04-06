const ROLES = Object.freeze({
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer",
});

const TRANSACTION_TYPES = Object.freeze({
  INCOME: "income",
  EXPENSE: "expense",
});

const CATEGORIES = Object.freeze([
  "salary",
  "freelance",
  "investment",
  "rent",
  "utilities",
  "groceries",
  "healthcare",
  "entertainment",
  "travel",
  "education",
  "tax",
  "other",
]);

const USER_STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
});

module.exports = { ROLES, TRANSACTION_TYPES, CATEGORIES, USER_STATUS };
