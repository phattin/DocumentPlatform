import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import {
  createDocumentController,
  getDocumentsController,
} from "../controllers/documentController";

export const documentsRouter = Router();

documentsRouter.post("/", createDocumentController);

documentsRouter.get("/", getDocumentsController);