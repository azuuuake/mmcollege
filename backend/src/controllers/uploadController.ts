import type { Request, Response } from "express";
import fs from "node:fs";
import { prisma } from "../config/prisma.js";
import { storageService, type UploadKind } from "../services/storageService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/httpError.js";
import { routeParam } from "../utils/params.js";

const kinds = new Set<UploadKind>(["profile", "logo", "portfolio", "credential"]);

export const upload = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const kind = req.body.type as UploadKind;
  if (!file) throw badRequest("A file is required");
  if (!kinds.has(kind)) throw badRequest("Invalid upload type");

  const stored = await storageService.save({
    buffer: file.buffer,
    mimeType: file.mimetype,
    originalName: file.originalname,
    userId: req.user!.id,
    kind
  });

  res.status(201).json({ file: stored });
});

export const downloadCredential = asyncHandler(async (req: Request, res: Response) => {
  const credential = await prisma.credential.findUnique({
    where: { id: routeParam(req, "credentialId") },
    include: { hairdresserProfile: true }
  });
  if (!credential?.documentKey) throw notFound("Document not found");

  const isOwner = credential.hairdresserProfile.userId === req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";
  if (!isOwner && !isAdmin) throw forbidden("Credential documents are not publicly available");

  const absolute = storageService.resolveAbsolutePath(credential.documentKey);
  if (!fs.existsSync(absolute)) throw notFound("Document file is missing");
  res.sendFile(absolute);
});
