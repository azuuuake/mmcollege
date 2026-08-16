import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { badRequest } from "../utils/httpError.js";

export type UploadKind = "profile" | "logo" | "portfolio" | "credential";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DOCUMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

export interface StoredFile {
  key: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface StorageService {
  save(input: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    userId: string;
    kind: UploadKind;
  }): Promise<StoredFile>;
  delete(key: string): Promise<void>;
  resolveAbsolutePath(key: string): string;
  isPublicKey(key: string): boolean;
}

function extensionFor(mimeType: string, originalName: string): string {
  const fromName = path.extname(originalName).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp", ".pdf"].includes(fromName)) {
    return fromName === ".jpeg" ? ".jpg" : fromName;
  }
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  if (mimeType === "application/pdf") return ".pdf";
  throw badRequest("Unsupported file type");
}

function assertAllowed(kind: UploadKind, mimeType: string, size: number) {
  if (kind === "credential") {
    if (!DOCUMENT_TYPES.has(mimeType)) {
      throw badRequest("Credential documents must be PDF or image files");
    }
    if (size > env.maxDocumentBytes) {
      throw badRequest("Credential document exceeds the maximum size");
    }
    return;
  }
  if (!IMAGE_TYPES.has(mimeType)) {
    throw badRequest("Only JPEG, PNG, and WebP images are allowed");
  }
  if (size > env.maxImageBytes) {
    throw badRequest("Image exceeds the maximum size");
  }
}

export class LocalStorageService implements StorageService {
  constructor(private readonly rootDir = env.uploadDir) {}

  async save(input: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    userId: string;
    kind: UploadKind;
  }): Promise<StoredFile> {
    assertAllowed(input.kind, input.mimeType, input.buffer.length);
    const ext = extensionFor(input.mimeType, input.originalName);
    const fileName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const relativeKey = path.posix.join(input.userId, input.kind, fileName);
    const absolute = path.join(this.rootDir, input.userId, input.kind, fileName);
    await fs.mkdir(path.dirname(absolute), { recursive: true });
    await fs.writeFile(absolute, input.buffer);
    return {
      key: relativeKey,
      url: `/uploads/${relativeKey}`,
      mimeType: input.mimeType,
      size: input.buffer.length
    };
  }

  async delete(key: string): Promise<void> {
    const absolute = this.resolveAbsolutePath(key);
    await fs.unlink(absolute).catch(() => undefined);
  }

  resolveAbsolutePath(key: string): string {
    const normalised = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
    const absolute = path.join(this.rootDir, normalised);
    if (!absolute.startsWith(path.resolve(this.rootDir))) {
      throw badRequest("Invalid file key");
    }
    return absolute;
  }

  isPublicKey(key: string): boolean {
    return /\/(profile|logo|portfolio)\//.test(`/${key.replaceAll("\\", "/")}`);
  }
}

export const storageService: StorageService = new LocalStorageService();
