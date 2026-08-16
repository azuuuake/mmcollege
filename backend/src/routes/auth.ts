import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from "../validators/auth.js";

export const authRouter = Router();

authRouter.post("/register", authRateLimit, validateBody(registerSchema), authController.register);
authRouter.post("/login", authRateLimit, validateBody(loginSchema), authController.login);
authRouter.post("/logout", requireAuth, authController.logout);
authRouter.get("/me", requireAuth, authController.me);
authRouter.post("/forgot-password", authRateLimit, validateBody(forgotPasswordSchema), authController.forgotPassword);
authRouter.post("/reset-password", authRateLimit, validateBody(resetPasswordSchema), authController.resetPassword);
