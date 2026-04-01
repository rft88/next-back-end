import { riotClient } from "../lib/riotClient.js";
import { getMatchRegion } from "../lib/regions.js";
import { getRuneMap } from "../lib/runes.js";

const MATCHES_PAGE_SIZE = 10;

function formatMatches(matchesResponse, puuid) {
  return matchesResponse
    .map((res) => {
      const match = res.data;
      const participants = match.info.participants;
      const myPlayer = participants.find((p) => p.puuid === puuid);

      if (!myPlayer) return null;

      const teamId = myPlayer.teamId;
      const myTeam = participants.filter((p) => p.teamId === teamId);
      const enemyTeam = participants.filter((p) => p.teamId !== teamId);

      return {
        matchId: match.metadata.matchId,
        champion: myPlayer.championName,
        kills: myPlayer.kills,
        deaths: myPlayer.deaths,
        assists: myPlayer.assists,
        win: myPlayer.win,
        cs: myPlayer.totalMinionsKilled,
        gold: myPlayer.goldEarned,
        summoner1Id: myPlayer.summoner1Id,
        summoner2Id: myPlayer.summoner2Id,
        primaryRune: myPlayer.perks.styles[0].selections[0].perk,
        secondaryRunes: myPlayer.perks.styles[1].selections.map((s) => s.perk),
        secondaryStyleId: myPlayer.perks.styles[1].style,
        items: [
          myPlayer.item0,
          myPlayer.item1,
          myPlayer.item2,
          myPlayer.item3,
          myPlayer.item4,
          myPlayer.item5,
        ],
        item6: myPlayer.item6,
        item7: myPlayer.roleBoundItem,
        damage: myPlayer.totalDamageDealtToChampions,
        duration: match.info.gameDuration,
        queueId: match.info.queueId,
        gameCreation: match.info.gameCreation,
        gameEndTimestamp: match.info.gameEndTimestamp || match.info.gameCreation,
        myTeam,
        enemyTeam,
      };
    })
    .filter(Boolean);
}

export async function getPlayerSummary({
  riotId,
  platformRegion,
  start = 0,
  count = MATCHES_PAGE_SIZE,
}) {
  const trimmed = riotId?.trim?.() || "";

  if (!trimmed.includes("#")) {
    const error = new Error("Enter a Riot ID in the format SummonerName#TAG");
    error.status = 400;
    throw error;
  }

  const [gameName, tagLine] = trimmed.split("#");

  if (!gameName || !tagLine) {
    const error = new Error("Enter a Riot ID in the format SummonerName#TAG");
    error.status = 400;
    throw error;
  }

  const matchRegion = getMatchRegion(platformRegion);

  const accountResponse = await riotClient.get(
    `https://${matchRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  );

  const account = accountResponse.data;

  const [summonerResponse, leagueResponse, matchIdsResponse, runeMap] =
    await Promise.all([
      riotClient.get(
        `https://${platformRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${account.puuid}`,
      ),
      riotClient.get(
        `https://${platformRegion}.api.riotgames.com/lol/league/v4/entries/by-puuid/${account.puuid}`,
      ),
      riotClient.get(
        `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${account.puuid}/ids`,
        {
          params: {
            start,
            count,
          },
        },
      ),
      getRuneMap(),
    ]);

  const matchIds = matchIdsResponse.data || [];

  const matchesResponse = await Promise.all(
    matchIds.map((id) =>
      riotClient.get(
        `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/${id}`,
      ),
    ),
  );

  const matches = formatMatches(matchesResponse, account.puuid);

  return {
    playerData: account,
    summonerData: summonerResponse.data,
    leagueData: leagueResponse.data,
    matches,
    runeMap,
    pagination: {
      start,
      count,
      nextStart: start + matchIds.length,
      hasMoreMatches: matchIds.length === count,
    },
  };
}

export async function getMoreMatches({
  puuid,
  platformRegion,
  start = 0,
  count = MATCHES_PAGE_SIZE,
}) {
  const matchRegion = getMatchRegion(platformRegion);

  const matchIdsResponse = await riotClient.get(
    `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
    {
      params: { start, count },
    },
  );

  const matchIds = matchIdsResponse.data || [];

  if (matchIds.length === 0) {
    return {
      matches: [],
      pagination: {
        start,
        count,
        nextStart: start,
        hasMoreMatches: false,
      },
    };
  }

  const matchesResponse = await Promise.all(
    matchIds.map((id) =>
      riotClient.get(
        `https://${matchRegion}.api.riotgames.com/lol/match/v5/matches/${id}`,
      ),
    ),
  );

  const matches = formatMatches(matchesResponse, puuid);

  return {
    matches,
    pagination: {
      start,
      count,
      nextStart: start + matchIds.length,
      hasMoreMatches: matchIds.length === count,
    },
  };
}