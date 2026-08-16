import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const skills = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.skill.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  res.json({ items });
});

export const qualifications = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.qualification.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  res.json({ items });
});
