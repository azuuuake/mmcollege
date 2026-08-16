import { Router } from "express";
import * as catalogueController from "../controllers/catalogueController.js";
import * as messageController from "../controllers/messageController.js";
import * as uploadController from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadMemory } from "../middleware/upload.js";
import { validateBody } from "../middleware/validate.js";
import { reportSchema } from "../validators/message.js";
import { adminRouter } from "./admin.js";
import { applicationRouter } from "./applications.js";
import { authRouter } from "./auth.js";
import { employerRouter } from "./employers.js";
import { hairdresserRouter } from "./hairdressers.js";
import { jobRouter } from "./jobs.js";
import { conversationRouter } from "./messages.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/hairdressers", hairdresserRouter);
apiRouter.use("/employers", employerRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/conversations", conversationRouter);
apiRouter.use("/admin", adminRouter);

apiRouter.get("/skills", catalogueController.skills);
apiRouter.get("/qualifications", catalogueController.qualifications);
apiRouter.get("/notifications", requireAuth, messageController.listNotifications);
apiRouter.post("/notifications/:id/read", requireAuth, messageController.readNotification);
apiRouter.post("/notifications/read-all", requireAuth, messageController.readAllNotifications);
apiRouter.post("/reports", requireAuth, validateBody(reportSchema), messageController.createReport);
apiRouter.post("/uploads", requireAuth, uploadMemory.single("file"), uploadController.upload);
apiRouter.get("/files/credentials/:credentialId", requireAuth, uploadController.downloadCredential);
