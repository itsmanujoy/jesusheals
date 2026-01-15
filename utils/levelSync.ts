import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { supabase } from "@/lib/supabase";

/**
 * Hook that sets up real-time synchronization of level unlocks
 * Listens for changes in a game_state table and updates the game store
 */
export function useLevelSync() {
  const { setLevelsUnlocked } = useGameStore();

  useEffect(() => {
    // Fetch initial state
    const fetchGameState = async () => {
      try {
        const { data, error } = await supabase
          .from("game_state")
          .select("levels_unlocked")
          .eq("id", 1)
          .single();

        if (error) {
          console.error("Error fetching game state:", error);
          return;
        }

        if (data?.levels_unlocked) {
          setLevelsUnlocked(data.levels_unlocked);
        }
      } catch (err) {
        console.error("Error in fetchGameState:", err);
      }
    };

    fetchGameState();

    // Subscribe to level state changes
    const subscription = supabase
      .channel("level_controls")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_state",
          filter: "id=eq.1",
        },
        (payload: any) => {
          if (payload.new?.levels_unlocked) {
            setLevelsUnlocked(payload.new.levels_unlocked);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [setLevelsUnlocked]);
}

/**
 * Sync level unlock state to the database for real-time broadcasting
 */
export async function syncLevelUnlockToDatabase(
  levelsUnlocked: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, boolean>
) {
  try {
    const { error } = await supabase.from("game_state").upsert(
      {
        id: 1,
        levels_unlocked: levelsUnlocked,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Error syncing level unlock:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error in syncLevelUnlockToDatabase:", error);
    return false;
  }
}

/**
 * Polling function to check level unlock status
 * Used as a fallback when real-time subscriptions may not be active
 */
export async function pollLevelUnlockStatus(): Promise<Record<1 | 2 | 3 | 4 | 5 | 6 | 7, boolean> | null> {
  try {
    const { data, error } = await supabase
      .from("game_state")
      .select("levels_unlocked")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("Error polling level status:", error);
      return null;
    }

    return data?.levels_unlocked || null;
  } catch (err) {
    console.error("Error in pollLevelUnlockStatus:", err);
    return null;
  }
}


