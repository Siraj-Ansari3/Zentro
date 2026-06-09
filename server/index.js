import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import admin from "./config/firebaseAdmin.js";
import storeRoutes from "./routes/store/store.routes.js";
import dashboardRoutes from "./routes/dashboard/dashboard.routes.js";
import orderRoutes from "./routes/order/order.routes.js";
import courierRoutes from "./routes/courier/courier.routes.js";
import requestsRoutes from "./routes/requests/requests.routes.js"; 
import userProfileRoutes from "./routes/profile/userProfile.routes.js";
import customerRoutes from "./routes/customer/customer.routes.js"; 
import { verifyAuth } from "./middlewares/verifyAuth.js";
import { attachUser } from "./middlewares/attachUser.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());


connectDB();


app.use("/stores", storeRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/order", orderRoutes);
app.use("/courier", courierRoutes);
app.use("/requests", requestsRoutes); 
app.use("/users/", userProfileRoutes);
app.use("/customers", customerRoutes);



app.get(
  "/auth/bootstrap",
  verifyAuth,
  attachUser,
  async (req, res) => {
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
        joinedAt: m.createdAt,
      })),
    });
  }
);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});