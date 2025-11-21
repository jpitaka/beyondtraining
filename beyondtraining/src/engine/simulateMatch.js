// src/engine/simulateMatch.js
import { simulateMatchTick } from "./matchEngine";

export function simulateFullMatch(playerStats = {}) {
  const matchState = {
    minute: 1,
    goals: 0,
    events: []
  };

  for (let m = 1; m <= 90; m++) {
    matchState.minute = m;
    simulateMatchTick(matchState);
  }

  return {
    finalScore: matchState.goals,
    events: matchState.events
  };
}
