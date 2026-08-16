import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.js";
import { apiRouter } from "./routes/index.js";
import { storageService } from "./services/storageService.js";

export function createApp() {
  const app = express();

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  app.use(
    cors({
      origin: env.clientOrigin.split(",").map((item) => item.trim()),
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "mm-connect-api" });
  });

  app.use("/api", apiRouter);

  app.use("/uploads", (req, res, next) => {
    const key = req.path.replace(/^\/+/, "");
    if (!storageService.isPublicKey(key)) {
      res.status(403).json({
        error: { code: "FORBIDDEN", message: "This file is not publicly accessible" }
      });
      return;
    }
    next();
  }, express.static(path.resolve(env.uploadDir)));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
