// =========================================================
// MATCH ENGINE LITE — Simulação simples mas realista de jogo
// =========================================================

export function simulateMatch(player, context) {
  // ------------------------------------------
  // 1. Inputs esperados
  // ------------------------------------------

  const {
    remate,
    passe,
    drible,
    velocidade,
    resistencia,
    composura,
    moral,
    condicaoFisica,
    boosts = {},
  } = player;

  const {
    dificuldadeAdversario = 50,
    importancia = 1, // 1 normal, 1.2 clássico, 1.5 final
  } = context;

  // ------------------------------------------
  // 2. Overall do dia (dinâmico)
  // ------------------------------------------

  let baseOverall =
    remate * 0.15 +
    passe * 0.25 +
    drible * 0.25 +
    velocidade * 0.15 +
    composura * 0.20;

  // Ajustes
  const moralFactor = 1 + (moral - 50) / 200; // ± 25%
  const condicaoFactor = Math.max(0.7, condicaoFisica / 100); // nunca desce abaixo de 0.7
  const treinoBoost = boosts.treino || 0; // ex: 0.05 = +5%

  let overallDoDia =
    baseOverall * moralFactor * condicaoFactor * (1 + treinoBoost);

  // Penalização pela força do adversário
  overallDoDia *= 1 - (dificuldadeAdversario - 50) / 300;

  // Garante limites razoáveis
  overallDoDia = Math.max(20, Math.min(99, overallDoDia));

  // ------------------------------------------
  // 3. Roll principal
  // ------------------------------------------

  const roll = Math.floor(Math.random() * 20) + 1;

  let tier;
  if (roll === 1) tier = "desastre";
  else if (roll <= 5) tier = "mau";
  else if (roll <= 10) tier = "fraco";
  else if (roll <= 15) tier = "normal";
  else if (roll <= 18) tier = "bom";
  else tier = "excelente";

  // Ajustar tier conforme overall
  if (overallDoDia > 75 && (tier === "mau" || tier === "fraco"))
    tier = "normal";

  if (overallDoDia < 45 && tier === "bom")
    tier = "normal";

  // ------------------------------------------
  // 4. Estatísticas segundo o tier final
  // ------------------------------------------

  let golo = 0;
  let assist = 0;
  let passesChave = 0;
  let nota = 6.0;

  switch (tier) {
    case "desastre":
      passesChave = randomRange(0, 1);
      nota = randomRange(4.0, 5.0);
      break;
    case "mau":
      passesChave = randomRange(0, 2);
      nota = randomRange(5.0, 5.9);
      break;
    case "fraco":
      passesChave = randomRange(1, 3);
      nota = randomRange(5.8, 6.3);
      break;
    case "normal":
      passesChave = randomRange(2, 4);
      if (roll > 12 && Math.random() < 0.12) golo = 1;
      if (Math.random() < 0.15) assist = 1;
      nota = randomRange(6.3, 7.2);
      break;
    case "bom":
      passesChave = randomRange(3, 6);
      if (Math.random() < 0.3) golo = 1;
      if (Math.random() < 0.35) assist = 1;
      nota = randomRange(7.2, 8.2);
      break;
    case "excelente":
      passesChave = randomRange(4, 7);
      if (Math.random() < 0.5) golo = randomRange(1, 2);
      if (Math.random() < 0.45) assist = randomRange(1, 2);
      nota = randomRange(8.2, 9.4);
      break;
  }

  // Ajuste fino com o overall do dia
  nota += (overallDoDia - 50) / 100; // +0.3 se overall = 80

  // Limites finais
  nota = Math.min(9.8, Math.max(4.0, nota));

  // ------------------------------------------
  // 5. Impactos pós-jogo
  // ------------------------------------------

  let moralDelta = 0;
  let cfDelta = -randomRange(8, 18); // desgaste normal

  if (nota >= 8.5) moralDelta = +6;
  else if (nota >= 7.5) moralDelta = +3;
  else if (nota < 6) moralDelta = -3;

  const relTreinadorDelta = moralDelta > 0 ? +2 : -1;
  const relAdeptosDelta = Math.round((nota - 6) * 2);

  // ------------------------------------------
  // 6. Resumo narrativo automático
  // ------------------------------------------

  const resumo = generateNarrative({ tier, golo, assist, passesChave });

  // ------------------------------------------
  // 7. Output final
  // ------------------------------------------

  return {
    tier,
    nota: Number(nota.toFixed(1)),
    golo,
    assistencias: assist,
    passesChave,
    resumo,
    moralDelta,
    cfDelta,
    relTreinadorDelta,
    relAdeptosDelta,
    roll,
    overallDoDia: Math.round(overallDoDia),
  };
}

// =========================================================
// Funções auxiliares
// =========================================================

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNarrative({ tier, golo, assist, passesChave }) {
  const bases = {
    desastre: [
      "Jogo muito abaixo do esperado. Viste-te aflito do início ao fim.",
      "Nada saiu bem hoje — precisas reagir rapidamente.",
    ],
    mau: [
      "Tiveste dificuldades em impor o teu futebol.",
      "Foste discreto e cometeste erros importantes.",
    ],
    fraco: [
      "Não conseguiste manter consistência no meio-campo.",
      "Jogo apagado, sem grande impacto.",
    ],
    normal: [
      "Cumpriste sem deslumbrar. Contribuição estável.",
      "Mostraste trabalho, mas faltou um toque de inspiração.",
    ],
    bom: [
      "Excelente presença no meio-campo. Fizeste a diferença.",
      "Jogaste com confiança e influenciaste o jogo.",
    ],
    excelente: [
      "Brilhaste intensamente — foste o cérebro da equipa hoje.",
      "Domínio absoluto. Uma exibição para recordar.",
    ],
  };

  let texto = bases[tier][Math.floor(Math.random() * bases[tier].length)];

  if (golo > 0) texto += ` Marcaste ${golo} golo${golo > 1 ? "s" : ""}.`;
  if (assist > 0) texto += ` Fizeste ${assist} assistência${assist > 1 ? "s" : ""}.`;
  if (passesChave >= 4)
    texto += ` Criaste várias oportunidades perigosas.`;

  return texto;
}
