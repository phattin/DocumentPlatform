import express from "express";
import cors from "cors";
import "dotenv/config";
import { documentsRouter } from "./routes/documentRoute";

export const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/documents", documentsRouter);

app.get("/health", (_, res) => res.json({ ok: true }));