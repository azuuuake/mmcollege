import { Router } from "express";
import * as hairdresserController from "../controllers/hairdresserController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  credentialSchema,
  experienceSchema,
  hairdresserProfileSchema,
  portfolioSchema,
  searchQuerySchema,
  skillsSchema
} from "../validators/hairdresser.js";

export const hairdresserRouter = Router();

hairdresserRouter.get("/", validateQuery(searchQuerySchema), hairdresserController.search);
hairdresserRouter.get("/me/dashboard", requireAuth, requireRole("HAIRDRESSER"), hairdresserController.dashboard);
hairdresserRouter.get("/:id", hairdresserController.getPublic);
hairdresserRouter.post(
  "/profile",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(hairdresserProfileSchema),
  hairdresserController.createProfile
);
hairdresserRouter.put(
  "/profile",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(hairdresserProfileSchema),
  hairdresserController.updateProfile
);
hairdresserRouter.post("/skills", requireAuth, requireRole("HAIRDRESSER"), validateBody(skillsSchema), hairdresserController.setSkills);
hairdresserRouter.delete("/skills/:skillId", requireAuth, requireRole("HAIRDRESSER"), hairdresserController.removeSkill);
hairdresserRouter.post(
  "/qualifications",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(credentialSchema),
  hairdresserController.addCredential
);
hairdresserRouter.put(
  "/qualifications/:id",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(credentialSchema.partial()),
  hairdresserController.updateCredential
);
hairdresserRouter.delete("/qualifications/:id", requireAuth, requireRole("HAIRDRESSER"), hairdresserController.deleteCredential);
hairdresserRouter.post(
  "/experience",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(experienceSchema),
  hairdresserController.addExperience
);
hairdresserRouter.put(
  "/experience/:id",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(experienceSchema.partial()),
  hairdresserController.updateExperience
);
hairdresserRouter.delete("/experience/:id", requireAuth, requireRole("HAIRDRESSER"), hairdresserController.deleteExperience);
hairdresserRouter.post(
  "/portfolio",
  requireAuth,
  requireRole("HAIRDRESSER"),
  validateBody(portfolioSchema),
  hairdresserController.addPortfolio
);
hairdresserRouter.delete("/portfolio/:id", requireAuth, requireRole("HAIRDRESSER"), hairdresserController.deletePortfolio);
