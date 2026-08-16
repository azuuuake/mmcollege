import type { Request, Response } from "express";
import * as employerService from "../services/employerService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeParam } from "../utils/params.js";

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  const profile = await employerService.getPublicEmployer(routeParam(req, "id"));
  res.json({ profile });
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await employerService.getEmployerDashboard(req.user!.id);
  res.json(data);
});

export const createProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await employerService.upsertEmployerProfile(req.user!.id, req.body, true);
  res.status(201).json({ profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await employerService.upsertEmployerProfile(req.user!.id, req.body);
  res.json({ profile });
});
