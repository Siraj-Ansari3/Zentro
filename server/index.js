import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import admin from "./config/firebaseAdmin.js";
import storeRoutes from "./routes/store/store.routes.js";
import dashboardRoutes from "./routes/dashboard/dashboard.routes.js";
import orderRoutes from "./routes/order/order.routes.js";
import { verifyAuth } from "./middlewares/verifyAuth.js";
import { attachUser } from "./middlewares/attachUser.js";

dotenv.config();

const app = express();


// middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// connect database
connectDB();


app.use("/stores", storeRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/order", orderRoutes);

// app.post("/stores", (req, res) => {
//   console.log("Received request to create store with data:", req.body);
//   res.status(201).json({ message: "Store created successfully" });
// });

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get(
  "/auth/bootstrap",
  verifyAuth,
  attachUser,
  async (req, res) => {
    console.log("Bootstrapping for user:", req.user.email);
    const Membership = (await import("./models/Membership.js")).default;

    const memberships = await Membership.find({
      userId: req.user.id,
    }).populate("storeId");

    res.json({
      user: req.user,
      memberships: memberships.map((m) => ({
        storeId: m.storeId._id,
        storeName: m.storeId.name,
        role: m.role,
        status: m.status,
      })),
    });
  }
);

app.get("/test", async (req, res) => {
  try {
    const users = await admin.auth().listUsers(1);

    res.json(users.users);
  } catch (err) {
    res.status(500).json(err);
  }
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});