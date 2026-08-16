import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  adminUserQuerySchema,
  credentialQuerySchema,
  reportStatusSchema,
  reviewSchema,
  suspendSchema
} from "../validators/admin.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));
adminRouter.get("/stats", adminController.stats);
adminRouter.get("/users", validateQuery(adminUserQuerySchema), adminController.users);
adminRouter.get("/users/:id", adminController.userDetail);
adminRouter.put("/users/:id/suspend", validateBody(suspendSchema), adminController.suspend);
adminRouter.get("/credentials", validateQuery(credentialQuerySchema), adminController.credentials);
adminRouter.put("/credentials/:id/verify", validateBody(reviewSchema), adminController.verify);
adminRouter.put("/credentials/:id/reject", validateBody(reviewSchema), adminController.reject);
adminRouter.get("/reports", adminController.reports);
adminRouter.put("/reports/:id", validateBody(reportStatusSchema), adminController.updateReport);
