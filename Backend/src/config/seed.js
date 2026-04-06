require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { ROLES, TRANSACTION_TYPES, CATEGORIES } = require("./constants");

const users = [
  { name: "Alice Admin", email: "admin@gmail.com", password: "admin123", role: ROLES.ADMIN },
  { name: "Bob Analyst", email: "analyst@gmail.com", password: "analyst123", role: ROLES.ANALYST },
  { name: "Carol Viewer", email: "Carol@gmail.com", password: "carol123", role: ROLES.VIEWER },
];

const randomAmount = (min, max) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(2));

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const pastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

const seed = async () => {
  await connectDB();
  console.log("Connected. Seeding...");

  await User.deleteMany({});
  await Transaction.deleteMany({});

  const createdUsers = await User.create(users);
  const admin = createdUsers.find((u) => u.role === ROLES.ADMIN);

  const transactions = Array.from({ length: 60 }, (_, i) => ({
    amount: randomAmount(100, 10000),
    type: randomItem(Object.values(TRANSACTION_TYPES)),
    category: randomItem(CATEGORIES),
    date: pastDate(i * 5),
    description: `Seeded transaction ${i + 1}`,
    createdBy: admin._id,
  }));

  await Transaction.create(transactions);

  console.log(`Seeded ${createdUsers.length} users and ${transactions.length} transactions.`);
  console.log("\nTest credentials:");
  users.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`));

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
