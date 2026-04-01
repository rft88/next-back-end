import express from "express";
import { getMoreMatches, getPlayerSummary } from "../services/playerService.js";

const router = express.Router();

router.get("/player", async (req, res) => {
  try {
    const {
      riotId,
      platformRegion = "na1",
      start = "0",
      count = "10",
    } = req.query;

    const data = await getPlayerSummary({
      riotId,
      platformRegion,
      start: Number(start),
      count: Number(count),
    });

    res.json(data);
  } catch (error) {
    console.error("GET /api/player error:", error.response?.data || error.message);

    res.status(error.status || error.response?.status || 500).json({
      message:
        error.response?.data?.status?.message ||
        error.message ||
        "Failed to fetch player data",
    });
  }
});

router.get("/matches", async (req, res) => {
  try {
    const {
      puuid,
      platformRegion = "na1",
      start = "0",
      count = "10",
    } = req.query;

    if (!puuid) {
      return res.status(400).json({ message: "Missing puuid" });
    }

    const data = await getMoreMatches({
      puuid,
      platformRegion,
      start: Number(start),
      count: Number(count),
    });

    res.json(data);
  } catch (error) {
    console.error("GET /api/matches error:", error.response?.data || error.message);

    res.status(error.status || error.response?.status || 500).json({
      message:
        error.response?.data?.status?.message ||
        error.message ||
        "Failed to load more matches",
    });
  }
});

export default router;