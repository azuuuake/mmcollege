import { Router } from "express";
import * as jobController from "../controllers/jobController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";
import { applySchema, jobListQuerySchema, jobSchema, jobUpdateSchema } from "../validators/job.js";

export const jobRouter = Router();

jobRouter.get("/", optionalAuth, validateQuery(jobListQuerySchema), jobController.list);
jobRouter.get("/:id", optionalAuth, jobController.getOne);
jobRouter.post("/", requireAuth, requireRole("EMPLOYER"), validateBody(jobSchema), jobController.create);
jobRouter.put("/:id", requireAuth, requireRole("EMPLOYER"), validateBody(jobUpdateSchema), jobController.update);
jobRouter.delete("/:id", requireAuth, requireRole("EMPLOYER"), jobController.remove);
jobRouter.post("/:id/apply", requireAuth, requireRole("HAIRDRESSER"), validateBody(applySchema), jobController.apply);
jobRouter.get("/:id/matches", requireAuth, requireRole("EMPLOYER"), jobController.matches);
