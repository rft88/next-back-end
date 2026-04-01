export function getMatchRegion(platformRegion) {
  const americas = ["na1", "br1", "la1", "la2"];
  const asia = ["kr", "jp1", "oc1", "ph2", "sg2", "th2", "tw2", "vn2"];

  if (americas.includes(platformRegion)) return "americas";
  if (asia.includes(platformRegion)) return "asia";
  return "europe";
}