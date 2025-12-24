import express from "express";
import cors from "cors";
import { container } from "./config/container.js";
import { createLanguageRoutes } from "./features/language/presentation/routes/languageRoutes.js";
import { createFlashcardRoutes } from "./features/flashcard/presentation/routes/flashcardRoutes.js";

const app = express();

app.use(cors({
  origin: '*',
}));
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running 🚀" });
});

// Feature routes
const languageController = container.get("languageController");
app.use("/api/languages", createLanguageRoutes(languageController));

const flashcardController = container.get("flashcardController");
app.use("/api/flashcards", createFlashcardRoutes(flashcardController));

// Graceful shutdown
process.on("SIGTERM", async () => {
  await container.cleanup();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await container.cleanup();
  process.exit(0);
});

export default app;