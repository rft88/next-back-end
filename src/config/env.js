import "dotenv/config";

const requiredEnvVars = ["RIOT_API_KEY"];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  riotApiKey: process.env.RIOT_API_KEY,
  port: Number(process.env.PORT || 3001),
  clientOrigin: process.env.CLIENT_ORIGIN || "https://next-front-end.onrender.com",
};

//5173 back 3001 front