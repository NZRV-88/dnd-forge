import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleNameGenerator } from "./routes/name-generator";
import { handleAdvancedNameGenerator } from "./routes/advanced-name-generator";
import { shareToTelegram, shareToVK } from "./routes/share-roll";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  
  // Name generator API
  app.post("/api/name-generator", handleNameGenerator);
  
  // Advanced name generator API (syllable-based) - прокси к основному файлу
  app.post("/api/advanced-name-generator", handleAdvancedNameGenerator);

  // Social sharing API
  app.post("/api/share/telegram", shareToTelegram);
  app.post("/api/share/vk", shareToVK);

  return app;
}
