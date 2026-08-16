import type { Request } from "express";
import { badRequest } from "./httpError.js";

export function routeParam(req: Request, name: string): string {
  const value = req.params[name];
  if (typeof value !== "string" || !value) {
    throw badRequest(`Missing route parameter: ${name}`);
  }
  return value;
}
