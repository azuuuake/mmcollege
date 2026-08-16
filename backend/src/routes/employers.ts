import { Router } from "express";
import * as employerController from "../controllers/employerController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { employerProfileSchema } from "../validators/employer.js";

export const employerRouter = Router();

employerRouter.get("/me/dashboard", requireAuth, requireRole("EMPLOYER"), employerController.dashboard);
employerRouter.get("/:id", employerController.getPublic);
employerRouter.post(
  "/profile",
  requireAuth,
  requireRole("EMPLOYER"),
  validateBody(employerProfileSchema),
  employerController.createProfile
);
employerRouter.put(
  "/profile",
  requireAuth,
  requireRole("EMPLOYER"),
  validateBody(employerProfileSchema),
  employerController.updateProfile
);
