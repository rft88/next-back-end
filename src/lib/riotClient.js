import axios from "axios";
import { env } from "../config/env.js";

export const riotClient = axios.create({
  timeout: 15000,
  headers: {
    "X-Riot-Token": env.riotApiKey,
  },
});