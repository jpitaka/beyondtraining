// src/engine/eventTable.js

export const EVENT_TABLE = [
  {
    type: "attack",
    weight: 45,
    description: "A tua equipa avança no terreno.",
  },
  {
    type: "lost_possession",
    weight: 35,
    description: "Perda de bola no meio-campo.",
  },
  {
    type: "shot",
    weight: 15,
    description: "Remate à baliza!",
  },
  {
    type: "goal",
    weight: 5,
    description: "GOLO!",
  }
];

// devolve um evento tendo em conta pesos
export function getRandomEvent() {
  const totalWeight = EVENT_TABLE.reduce((sum, e) => sum + e.weight, 0);
  const rand = Math.random() * totalWeight;

  let cumulative = 0;
  for (const event of EVENT_TABLE) {
    cumulative += event.weight;
    if (rand <= cumulative) return event;
  }

  return EVENT_TABLE[0]; // fallback
}
