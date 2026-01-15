import { supabase, PlayerRecord } from "@/lib/supabase";

/**
 * Calculate the player's current rank based on their score
 * Returns the rank position (1-based)
 */
export async function calculatePlayerRank(finalScore: number): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("final_score")
      .order("final_score", { ascending: false });

    if (error) {
      console.error("Error fetching leaderboard for rank:", error);
      return 0;
    }

    if (!data || data.length === 0) return 1;

    // Count how many players have a higher score
    const playersWithHigherScore = data.filter(
      (player) => player.final_score > finalScore
    ).length;

    return playersWithHigherScore + 1;
  } catch (error) {
    console.error("Error calculating rank:", error);
    return 0;
  }
}

/**
 * Get rank statistics for a given score
 */
export async function getRankStats(finalScore: number): Promise<{
  rank: number;
  totalPlayers: number;
  percentile: number;
}> {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("final_score");

    if (error) {
      console.error("Error fetching rank stats:", error);
      return { rank: 0, totalPlayers: 0, percentile: 0 };
    }

    const totalPlayers = data?.length || 0;
    const playersWithHigherScore = data?.filter(
      (player) => player.final_score > finalScore
    ).length || 0;

    const rank = playersWithHigherScore + 1;
    const percentile = totalPlayers > 0 
      ? Math.round(((totalPlayers - rank + 1) / totalPlayers) * 100)
      : 0;

    return { rank, totalPlayers, percentile };
  } catch (error) {
    console.error("Error getting rank stats:", error);
    return { rank: 0, totalPlayers: 0, percentile: 0 };
  }
}
