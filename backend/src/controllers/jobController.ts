import type { Request, Response } from "express";
import * as jobService from "../services/jobService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeParam } from "../utils/params.js";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  const result = await jobService.listJobs({
    q: query.q,
    location: query.location,
    employmentType: query.employmentType,
    mine: query.mine === "true",
    userId: req.user?.id,
    page: query.page ? Number(query.page) : undefined,
    pageSize: query.pageSize ? Number(query.pageSize) : undefined
  });
  res.json(result);
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.getJob(routeParam(req, "id"), req.user?.id);
  res.json({ job });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.createJob(req.user!.id, req.body);
  res.status(201).json({ job });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const job = await jobService.updateJob(req.user!.id, routeParam(req, "id"), req.body);
  res.json({ job });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await jobService.deleteJob(req.user!.id, routeParam(req, "id"));
  res.status(204).send();
});

export const apply = asyncHandler(async (req: Request, res: Response) => {
  const application = await jobService.applyToJob(req.user!.id, routeParam(req, "id"), req.body.coverNote);
  res.status(201).json({ application });
});

export const listApplications = asyncHandler(async (req: Request, res: Response) => {
  const applications = await jobService.listApplications(req.user!.id, req.user!.role);
  res.json({ applications });
});

export const matches = asyncHandler(async (req: Request, res: Response) => {
  const items = await jobService.matchJobCandidates(req.user!.id, routeParam(req, "id"));
  res.json({ items });
});
