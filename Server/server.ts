import express from "express";
import { documentsRouter } from "./routes/documentRoute";

const app = express();

app.use(express.json());

app.use("/documents", documentsRouter);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});