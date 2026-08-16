import type { Request, Response } from "express";
import * as hairdresserService from "../services/hairdresserService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeParam } from "../utils/params.js";

export const search = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const result = await hairdresserService.searchHairdressers({
    q: query.q,
    location: query.location,
    skillIds: query.skillIds ? query.skillIds.split(",").filter(Boolean) : undefined,
    qualificationId: query.qualificationId,
    minExperience: query.minExperience ? Number(query.minExperience) : undefined,
    availability: query.availability,
    employmentType: query.employmentType,
    verified: query.verified === "true",
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined
  });
  res.json(result);
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  const profile = await hairdresserService.getPublicHairdresser(routeParam(req, "id"));
  res.json({ profile });
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const data = await hairdresserService.getHairdresserDashboard(req.user!.id);
  res.json(data);
});

export const createProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await hairdresserService.upsertHairdresserProfile(req.user!.id, req.body, true);
  res.status(201).json({ profile });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await hairdresserService.upsertHairdresserProfile(req.user!.id, req.body);
  res.json({ profile });
});

export const setSkills = asyncHandler(async (req: Request, res: Response) => {
  const profile = await hairdresserService.setSkills(req.user!.id, req.body.skillIds);
  res.json({ profile });
});

export const removeSkill = asyncHandler(async (req: Request, res: Response) => {
  const profile = await hairdresserService.removeSkill(req.user!.id, routeParam(req, "skillId"));
  res.json({ profile });
});

export const addCredential = asyncHandler(async (req: Request, res: Response) => {
  const credential = await hairdresserService.addCredential(req.user!.id, req.body);
  res.status(201).json({ credential });
});

export const updateCredential = asyncHandler(async (req: Request, res: Response) => {
  const credential = await hairdresserService.updateCredential(req.user!.id, routeParam(req, "id"), req.body);
  res.json({ credential });
});

export const deleteCredential = asyncHandler(async (req: Request, res: Response) => {
  await hairdresserService.deleteCredential(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
});

export const addExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await hairdresserService.addExperience(req.user!.id, req.body);
  res.status(201).json({ experience });
});

export const updateExperience = asyncHandler(async (req: Request, res: Response) => {
  const experience = await hairdresserService.updateExperience(req.user!.id, routeParam(req, "id"), req.body);
  res.json({ experience });
});

export const deleteExperience = asyncHandler(async (req: Request, res: Response) => {
  await hairdresserService.deleteExperience(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
});

export const addPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const item = await hairdresserService.addPortfolioItem(req.user!.id, req.body);
  res.status(201).json({ item });
});

export const deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
  await hairdresserService.deletePortfolioItem(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
});
