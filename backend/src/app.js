import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// routes import

import userRouter from "./routes/user.routes.js";

// routes declaration

app.use("/api/v1/user", userRouter);

export default app;