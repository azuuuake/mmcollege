import multer from "multer";
import { env } from "../config/env.js";

export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxDocumentBytes }
});
