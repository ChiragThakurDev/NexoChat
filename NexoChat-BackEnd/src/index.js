import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";

import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import messageRoutes from "./routes/message.route.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import path from "path";
dotenv.config();
const port = process.env.PORT;
const __dirname = path.resolve();
const allowedOrigins = [process.env.Orgin];
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: allowedOrigins,

    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(path.join(__dirname, "public", "../NexoChat-FrontEnd/dist")),
  );
  app.get("*", (req, res) => {
    res.sendFile(
      path.join(__dirname, "public", "../NexoChat-FrontEnd/dist/index.html"),
    );
  });
}
server.listen(port || 3000, "0.0.0.0", () => {
  console.log(`Server is running on Port ${port}`);
  connectDB();
});
