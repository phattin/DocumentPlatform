import { Request, Response } from "express";
import { createDocument, getUserDocuments } from "../services/documentService";

export async function createDocumentController(req: Request, res: Response) {
  try {
    // const uid = (req as any).user.uid;
    const uid = "test-user";
    const { title, description, subject, fileUploaded } = req.body;

    if (!title || !description || !subject || !fileUploaded) {
      return res.status(400).json({ message: "Missing title or url" });
    }

    const result = await createDocument(
    uid,
    title,
    description,
    subject,
    fileUploaded
    );

    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to create document" });
  }
}

export async function getDocumentsController(req: Request, res: Response) {
  try {
    // const uid = (req as any).user.uid;
    const uid = "test-user";

    const docs = await getUserDocuments(uid);

    return res.json(docs);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch documents" });
  }
}