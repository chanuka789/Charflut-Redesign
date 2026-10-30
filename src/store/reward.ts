"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Discount for 0, 1, 2 or 3 baskets in the shooting game. */
export const REWARD_BY_MAKES = [0, 0.05, 0.1, 0.15] as const;

export const rewardCode = (discount: number) => `CHARFLUT${Math.round(discount * 100)}`;

interface RewardState {
  /** The best discount won so far (0 to 0.15). */
  discount: number;
  /** The game has been shown once; it doesn't open by itself again. */
  seen: boolean;
  win: (discount: number) => void;
  markSeen: () => void;
}

export const useReward = create<RewardState>()(
  persist(
    (set) => ({
      discount: 0,
      seen: false,
      win: (discount) => set((s) => ({ discount: Math.max(s.discount, discount) })),
      markSeen: () => set({ seen: true }),
    }),
    { name: "charflut-reward", storage: createJSONStorage(() => localStorage) },
  ),
);
