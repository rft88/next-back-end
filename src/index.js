import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import playerRoutes from "./routes/playerRoutes.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
  }),
);

app.use(express.json());

app.use("/api", playerRoutes);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(env.port, () => {
  console.log(`Server listening on port ${env.port}`);
});