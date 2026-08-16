import type { Request, Response } from "express";
import * as adminService from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { routeParam } from "../utils/params.js";

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await adminService.getAdminStats());
});

export const users = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  res.json(
    await adminService.listUsers({
      q: query.q,
      role: query.role as "HAIRDRESSER" | "EMPLOYER" | "ADMIN" | undefined,
      status: query.status as "ACTIVE" | "SUSPENDED" | undefined,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined
    })
  );
});

export const userDetail = asyncHandler(async (req: Request, res: Response) => {
  res.json({ user: await adminService.getUserAdminDetail(routeParam(req, "id")) });
});

export const suspend = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.setUserStatus(req.user!.id, routeParam(req, "id"), req.body.status);
  res.json({ user });
});

export const credentials = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  res.json(
    await adminService.listCredentials({
      status: query.status as "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED" | undefined,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined
    })
  );
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  const credential = await adminService.reviewCredential(
    req.user!.id,
    routeParam(req, "id"),
    "VERIFIED",
    req.body.notes
  );
  res.json({ credential });
});

export const reject = asyncHandler(async (req: Request, res: Response) => {
  const credential = await adminService.reviewCredential(
    req.user!.id,
    routeParam(req, "id"),
    "REJECTED",
    req.body.notes
  );
  res.json({ credential });
});

export const reports = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string | undefined>;
  res.json(
    await adminService.listReports({
      status: query.status as "OPEN" | "REVIEWED" | "DISMISSED" | undefined,
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined
    })
  );
});

export const updateReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await adminService.updateReport(routeParam(req, "id"), req.body.status, req.user!.id);
  res.json({ report });
});
