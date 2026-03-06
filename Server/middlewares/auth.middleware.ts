import type { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "../utils/firebaseAdmin";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];

  if (!token) {
    return res.status(401).json({ message: "Missing Authorization Bearer token" });
  }

  try {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}