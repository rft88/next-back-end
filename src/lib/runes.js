import axios from "axios";

let cachedRuneMap = null;
let cachedAt = 0;

const CACHE_TTL_MS = 1000 * 60 * 60;

export async function getRuneMap() {
  const now = Date.now();

  if (cachedRuneMap && now - cachedAt < CACHE_TTL_MS) {
    return cachedRuneMap;
  }

  const response = await axios.get(
    "https://ddragon.leagueoflegends.com/cdn/16.6.1/data/en_US/runesReforged.json",
    { timeout: 10000 },
  );

  const map = {};

  for (const style of response.data) {
    map[style.id] = style.icon;

    for (const slot of style.slots) {
      for (const rune of slot.runes) {
        map[rune.id] = rune.icon;
      }
    }
  }

  cachedRuneMap = map;
  cachedAt = now;

  return map;
}