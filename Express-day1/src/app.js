import express from "express";
import path from "path";
import userRoutes from "./routes/user.route.js";
import { logger } from "./middleware/logger.middleware.js";
import errorHandler from "./middleware/errorHandler.middleware.js";

export const app = express();

app.use(express.static(path.join(_dirname), "public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger);

app.use("/api", userRoutes);

app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

app.use(errorHandler);
