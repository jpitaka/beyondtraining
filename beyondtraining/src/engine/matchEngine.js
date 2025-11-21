// src/engine/matchEngine.js
import { getRandomEvent } from "./eventTable";

export function simulateMatchTick(state) {
  const event = getRandomEvent();

  switch (event.type) {
    case "attack":
      state.events.push(`⚽ ${state.minute}': ${event.description}`);
      break;

    case "lost_possession":
      state.events.push(`😬 ${state.minute}': ${event.description}`);
      break;

    case "shot":
      state.events.push(`🎯 ${state.minute}': ${event.description}`);
      // 30% hipóteses de ser golo
      if (Math.random() < 0.3) {
        state.goals += 1;
        state.events.push(`🥅 ${state.minute}': GOOOOLOOO!`);
      }
      break;

    case "goal":
      state.goals += 1;
      state.events.push(`🥅 ${state.minute}': ${event.description}`);
      break;
  }

  return state;
}
