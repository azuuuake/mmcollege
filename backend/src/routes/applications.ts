import { Router } from "express";
import * as jobController from "../controllers/jobController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const applicationRouter = Router();

applicationRouter.get("/", requireAuth, requireRole("HAIRDRESSER", "EMPLOYER"), jobController.listApplications);
