import { useState, useEffect } from "react";
import "./App.css";
import { scenes } from "./scenes";

const STORAGE_KEY = "beyondtraining_save_v1";

const BACKSTORIES = [
  {
    id: "diamante",
    title: "Diamante do Bairro",
    description:
      "Cresceste a jogar nas ruas e ringues do bairro. Toda a gente te conhece desde miúdo.",
    effectsText: "+ Moral inicial, menos pressão mediática."
  },
  {
    id: "academia",
    title: "Filho da Academia",
    description:
      "Entraste cedo na formação do clube. És “produto da casa” e toda a estrutura sabe quem és.",
    effectsText:
      "+ Relação inicial com o treinador / direcção, expectativas internas mais altas."
  },
  {
    id: "importacao",
    title: "Importação Estrangeira",
    description:
      "Vieste de outro país para tentar a sorte. Chegas como aposta de alguém lá em cima.",
    effectsText: "+ Técnica inicial, adaptação cultural mais difícil."
  },
  {
    id: "veterano",
    title: "Veterano Tardio",
    description:
      "Andaste anos em equipas pequenas ou noutra profissão. Agora tens a tua última oportunidade.",
    effectsText: "+ Atributos mentais, - Atributos físicos iniciais."
  }
];

const POSICOES = [
  "Médio Ofensivo (Maestro)",
  "Avançado Centro (Matador)",
  "Defesa Central (Muralha)",
  "Guarda-redes (Guardião)"
];

const BASE_STATS_POR_POSICAO = {
  "Médio Ofensivo (Maestro)": {
    remate: 5,
    passe: 7,
    drible: 7,
    velocidade: 5,
    resistencia: 5,
    compostura: 6
  },
  "Avançado Centro (Matador)": {
    remate: 8,
    passe: 4,
    drible: 5,
    velocidade: 6,
    resistencia: 5,
    compostura: 5
  },
  "Defesa Central (Muralha)": {
    remate: 3,
    passe: 4,
    drible: 3,
    velocidade: 4,
    resistencia: 7,
    compostura: 7
  },
  "Guarda-redes (Guardião)": {
    remate: 2,
    passe: 4,
    drible: 2,
    velocidade: 4,
    resistencia: 7,
    compostura: 8
  },
  default: {
    remate: 4,
    passe: 4,
    drible: 4,
    velocidade: 4,
    resistencia: 4,
    compostura: 4
  }
};

function criarJogadorInicial(formData) {
  const baseStats =
    BASE_STATS_POR_POSICAO[formData.position] || BASE_STATS_POR_POSICAO.default;

  let morale = 50;
  let stamina = 80;

  switch (formData.backstory) {
    case "diamante":
      morale += 10;
      break;
    case "academia":
      morale += 5;
      break;
    case "importacao":
      morale += 5;
      stamina -= 5;
      break;
    case "veterano":
      morale += 5;
      stamina -= 15;
      break;
    default:
      break;
  }

  return {
    name: formData.name || "Jogador Sem Nome",
    nickname: formData.nickname || "",
    position: formData.position,
    club: formData.club || "Clube Continental",
    backstory: formData.backstory,
    morale: clamp(morale, 0, 100),
    stamina: clamp(stamina, 0, 100),
    attributes: { ...baseStats },
    relations: {
      coach: 60,
      team: 50,
      fans: 40,
      media: 40
    },
    level: 1,
    xp: 0
  };
}

function App() {
  const [screen, setScreen] = useState("characterCreation"); // 'characterCreation' | 'weekHub' | 'game'
  const [currentSceneId, setCurrentSceneId] = useState("inicio");
  const [week, setWeek] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    position: POSICOES[0],
    club: "Clube Continental",
    backstory: "diamante"
  });

  const [player, setPlayer] = useState(null);
  const [lastTestResult, setLastTestResult] = useState(null);
  const [lastDelta, setLastDelta] = useState(null);

  const [freeActionText, setFreeActionText] = useState("");
  const [freeActionFeedback, setFreeActionFeedback] = useState("");

  const scene = scenes[currentSceneId];

  // carregar save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data.player) return;

      setPlayer(data.player);
      setScreen(data.screen || "weekHub");
      setCurrentSceneId(data.currentSceneId || "inicio");
      setWeek(data.week || 1);
      setLastTestResult(null);
      setLastDelta(null);
      setFreeActionText("");
      setFreeActionFeedback("");
    } catch (err) {
      console.warn("Falha a carregar save:", err);
    }
  }, []);

  // guardar save
  useEffect(() => {
    if (!player) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const data = {
      player,
      screen,
      currentSceneId,
      week
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Falha a guardar save:", err);
    }
  }, [player, screen, currentSceneId, week]);

  const handleOptionClick = (option) => {
    if (!player) return;

    let testResult = null;

    if (option.test) {
      testResult = runTest(option.test, player);
      setLastTestResult({
        ...testResult,
        description: option.test.description || "Lance importante",
        attribute: option.test.attribute
      });
    } else {
      setLastTestResult(null);
    }

    const effects = option.effects || {};
    const relationEffects = option.relationEffects || {};
    const xpGain = option.xp ?? 0;

    setPlayer((prev) => {
      if (!prev) return prev;
      if (option.reset) return prev;

      let updated = {
        ...prev,
        relations: { ...(prev.relations || {}) }
      };

      // XP + nível
      updated = applyXp(updated, xpGain);

      // CF / Moral
      const morale = clamp(updated.morale + (effects.morale ?? 0), 0, 100);
      const stamina = clamp(updated.stamina + (effects.stamina ?? 0), 0, 100);
      updated.morale = morale;
      updated.stamina = stamina;

      // relações
      for (const key of Object.keys(relationEffects)) {
        const current = updated.relations[key] ?? 50;
        const change = relationEffects[key];
        updated.relations[key] = clamp(current + change, 0, 100);
      }

      return updated;
    });

    setLastDelta({
      moraleChange: effects.morale ?? 0,
      staminaChange: effects.stamina ?? 0,
      relationsChange: relationEffects,
      xpChange: xpGain
    });

    let nextId = option.next ?? currentSceneId;

    if (option.test && testResult) {
      if (testResult.success) {
        nextId = option.nextOnSuccess ?? option.next ?? currentSceneId;
      } else {
        nextId = option.nextOnFailure ?? option.next ?? currentSceneId;
      }
    }

    if (option.goToWeekHub) {
      setLastTestResult(null);
      setFreeActionText("");
      setCurrentSceneId("inicio");
      setScreen("weekHub");
      setWeek((prev) => prev + 1);
      return;
    }

    setCurrentSceneId(nextId);
  };

  const handleFreeActionSubmit = () => {
    if (!player) return;

    const text = freeActionText.trim();
    if (!text) {
      setFreeActionFeedback("Escreve o que queres fazer em campo.");
      return;
    }

    const currentScene = scenes[currentSceneId];
    if (!currentScene || !Array.isArray(currentScene.intents)) {
      setFreeActionFeedback(
        "Neste momento tens de escolher uma das sugestões rápidas."
      );
      return;
    }

    const intent = findIntentForText(currentScene, text);
    if (!intent) {
      setFreeActionFeedback(
        "Não percebi bem a tua decisão. Tenta usar verbos simples como \"rematar\", \"driblar\" ou \"passar\"."
      );
      return;
    }

    const label = intent.label || intent.id || "ação";
    setFreeActionFeedback(`Interpretei como: ${label}.`);

    handleOptionClick(intent);
    setFreeActionText("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreatePlayer = (event) => {
    event.preventDefault();

    const novoJogador = criarJogadorInicial(formData);
    setPlayer(novoJogador);
    setWeek(1);
    setCurrentSceneId("inicio");
    setLastTestResult(null);
    setLastDelta(null);
    setFreeActionText("");
    setFreeActionFeedback("");
    setScreen("weekHub");
  };

  const handleTrainingChoice = (type) => {
    if (!player) return;

    let staminaChange = 0;
    let moraleChange = 0;
    let xpGain = 0;

    setPlayer((prev) => {
      if (!prev) return prev;

      let updated = {
        ...prev,
        attributes: { ...prev.attributes },
        relations: { ...(prev.relations || {}) }
      };

      if (type === "fisico") {
        staminaChange = +10;
        moraleChange = -5;
        xpGain = 10;
        updated.stamina = clamp(prev.stamina + staminaChange, 0, 100);
        updated.morale = clamp(prev.morale + moraleChange, 0, 100);
        updated.attributes.resistencia = (prev.attributes.resistencia || 0) + 1;
      } else if (type === "tecnico") {
        staminaChange = -5;
        moraleChange = +5;
        xpGain = 15;
        updated.stamina = clamp(prev.stamina + staminaChange, 0, 100);
        updated.morale = clamp(prev.morale + moraleChange, 0, 100);
        updated.attributes.remate = (prev.attributes.remate || 0) + 1;
        updated.attributes.passe = (prev.attributes.passe || 0) + 1;
      } else if (type === "descanso") {
        staminaChange = +15;
        moraleChange = +5;
        xpGain = 5;
        updated.stamina = clamp(prev.stamina + staminaChange, 0, 100);
        updated.morale = clamp(prev.morale + moraleChange, 0, 100);
      }

      updated = applyXp(updated, xpGain);

      return updated;
    });

    setLastTestResult(null);
    setLastDelta({
      moraleChange,
      staminaChange,
      relationsChange: {},
      xpChange: xpGain
    });

    setFreeActionText("");
    setFreeActionFeedback("");
    setCurrentSceneId("inicio");
    setScreen("game");
  };

  const handleResetCareer = () => {
    if (!confirm("Tens a certeza que queres começar uma nova carreira?")) {
      return;
    }

    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
    setScreen("characterCreation");
    setCurrentSceneId("inicio");
    setWeek(1);
    setLastTestResult(null);
    setLastDelta(null);
    setFreeActionText("");
    setFreeActionFeedback("");
    setFormData({
      name: "",
      nickname: "",
      position: POSICOES[0],
      club: "Clube Continental",
      backstory: "diamante"
    });
  };

  const xpNeeded = player ? xpForNext(player.level ?? 1) : 0;
  const xpPct =
    player && xpNeeded
      ? clamp(((player.xp ?? 0) * 100) / xpNeeded, 0, 100)
      : 0;

  return (
    <div className="app">
      <header className="header">
        <h1>Beyondtraining</h1>

        <div className="header-right">
          {player && (
            <div className="status-bar">
              <div className="status-item">
                <span className="status-label">Semana</span>
                <div className="status-row">
                  <span className="status-value">{week}</span>
                </div>
              </div>

              <div className="status-item">
                <span className="status-label">Nível</span>
                <div className="status-row">
                  <span className="status-value">{player.level ?? 1}</span>
                  <Bar value={xpPct} />
                  <Delta change={lastDelta?.xpChange ?? 0} />
                </div>
                <div className="status-xp-detail">
                  XP: {player.xp ?? 0} / {xpNeeded}
                </div>
              </div>

              <div className="status-item">
                <span className="status-label">Condição Física</span>
                <div className="status-row">
                  <span className="status-value">{player.stamina}</span>
                  <Bar value={player.stamina} />
                  <Delta change={lastDelta?.staminaChange ?? 0} />
                </div>
              </div>

              <div className="status-item">
                <span className="status-label">Moral</span>
                <div className="status-row">
                  <span className="status-value">{player.morale}</span>
                  <Bar value={player.morale} />
                  <Delta change={lastDelta?.moraleChange ?? 0} />
                </div>
              </div>
            </div>
          )}

          {player && (
            <button className="reset-button" onClick={handleResetCareer}>
              Nova carreira
            </button>
          )}
        </div>
      </header>

      {screen === "characterCreation" ? (
        <main className="content creation-content">
          <section className="creation-card">
            <h2>Nova Carreira</h2>
            <p className="creation-subtitle">
              Define quem és antes de entrares em campo.
            </p>

            <form onSubmit={handleCreatePlayer} className="creation-form">
              <div className="field-group">
                <label>
                  Nome do jogador
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Ex.: João Martins"
                  />
                </label>

                <label>
                  Alcunha (opcional)
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleFormChange}
                    placeholder="Ex.: Flash, Maestro..."
                  />
                </label>

                <label>
                  Clube inicial
                  <input
                    type="text"
                    name="club"
                    value={formData.club}
                    onChange={handleFormChange}
                    placeholder="Clube Continental"
                  />
                </label>

                <label>
                  Posição
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleFormChange}
                  >
                    {POSICOES.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="backstories">
                <h3>Backstory</h3>
                <p className="help-text">
                  Isto funciona como a tua “origem” de RPG. Tem impacto mecânico
                  na carreira.
                </p>

                <div className="backstory-grid">
                  {BACKSTORIES.map((b) => (
                    <label
                      key={b.id}
                      className={`backstory-card ${
                        formData.backstory === b.id
                          ? "backstory-card--active"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="backstory"
                        value={b.id}
                        checked={formData.backstory === b.id}
                        onChange={handleFormChange}
                      />
                      <div className="backstory-content">
                        <h4>{b.title}</h4>
                        <p>{b.description}</p>
                        <p className="effects-text">{b.effectsText}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="creation-actions">
                <button type="submit" className="primary-button">
                  Começar carreira
                </button>
              </div>
            </form>
          </section>
        </main>
      ) : screen === "weekHub" ? (
        <main className="content creation-content">
          <section className="creation-card week-card">
            <h2>Semana {week} – Treino</h2>
            <p className="creation-subtitle">
              Escolhe o foco da semana antes do próximo jogo.
            </p>

            {player && (
              <div className="week-status">
                <p>
                  <strong>Condição Física:</strong> {player.stamina}
                </p>
                <p>
                  <strong>Moral:</strong> {player.morale}
                </p>
              </div>
            )}

            <div className="week-options">
              <button
                className="week-option-button"
                onClick={() => handleTrainingChoice("fisico")}
              >
                <h3>Treino físico intenso</h3>
                <p>
                  Corridas, trabalho de força e resistência. Ficas mais
                  preparado para aguentar o jogo, mas chegas um pouco mais
                  carregado.
                </p>
                <p className="effects-text">
                  + Resistência, + CF, - um pouco de Moral
                </p>
              </button>

              <button
                className="week-option-button"
                onClick={() => handleTrainingChoice("tecnico")}
              >
                <h3>Treino técnico</h3>
                <p>
                  Finalização, passes em espaços curtos, combinações. Menos
                  carga física, mais foco na bola.
                </p>
                <p className="effects-text">
                  + Remate, + Passe, - um pouco de CF, + Moral
                </p>
              </button>

              <button
                className="week-option-button"
                onClick={() => handleTrainingChoice("descanso")}
              >
                <h3>Recuperação e descanso</h3>
                <p>
                  Sessões leves, massagem, gelo e foco em dormir bem. Chegas
                  mais fresco, mas não evoluis tanto.
                </p>
                <p className="effects-text">
                  ++ CF, + Moral, sem aumento directo de atributos
                </p>
              </button>
            </div>
          </section>
        </main>
      ) : (
        <main className="content">
          <aside className="sidebar">
            <h2>Ficha do Jogador</h2>
            {player && (
              <>
                <p>
                  <strong>Nome:</strong>{" "}
                  {player.name}
                  {player.nickname ? ` "${player.nickname}"` : ""}
                </p>
                <p>
                  <strong>Posição:</strong> {player.position}
                </p>
                <p>
                  <strong>Clube:</strong> {player.club}
                </p>
                <p>
                  <strong>Backstory:</strong>{" "}
                  {
                    BACKSTORIES.find((b) => b.id === player.backstory)?.title ??
                    "N/A"
                  }
                </p>

                <hr className="sidebar-divider" />

                <h3>Atributos</h3>
                <p>
                  <strong>Remate:</strong> {player.attributes.remate}
                </p>
                <p>
                  <strong>Passe:</strong> {player.attributes.passe}
                </p>
                <p>
                  <strong>Drible:</strong> {player.attributes.drible}
                </p>
                <p>
                  <strong>Velocidade:</strong> {player.attributes.velocidade}
                </p>
                <p>
                  <strong>Resistência:</strong> {player.attributes.resistencia}
                </p>
                <p>
                  <strong>Compostura:</strong> {player.attributes.compostura}
                </p>

                <hr className="sidebar-divider" />

                <h3>Relações</h3>

                <div className="relation-row">
                  <span className="relation-name">Treinador</span>
                  <div className="relation-main">
                    <span className="relation-value">
                      {player.relations?.coach ?? 50}{" "}
                      <span className="relation-label">
                        ({describeRelation(player.relations?.coach ?? 50)})
                      </span>
                    </span>
                    <Bar value={player.relations?.coach ?? 50} />
                    <Delta
                      change={lastDelta?.relationsChange?.coach ?? 0}
                    />
                  </div>
                </div>

                <div className="relation-row">
                  <span className="relation-name">Equipa</span>
                  <div className="relation-main">
                    <span className="relation-value">
                      {player.relations?.team ?? 50}{" "}
                      <span className="relation-label">
                        ({describeRelation(player.relations?.team ?? 50)})
                      </span>
                    </span>
                    <Bar value={player.relations?.team ?? 50} />
                    <Delta change={lastDelta?.relationsChange?.team ?? 0} />
                  </div>
                </div>

                <div className="relation-row">
                  <span className="relation-name">Adeptos</span>
                  <div className="relation-main">
                    <span className="relation-value">
                      {player.relations?.fans ?? 50}{" "}
                      <span className="relation-label">
                        ({describeRelation(player.relations?.fans ?? 50)})
                      </span>
                    </span>
                    <Bar value={player.relations?.fans ?? 50} />
                    <Delta change={lastDelta?.relationsChange?.fans ?? 0} />
                  </div>
                </div>

                <div className="relation-row">
                  <span className="relation-name">Imprensa</span>
                  <div className="relation-main">
                    <span className="relation-value">
                      {player.relations?.media ?? 50}{" "}
                      <span className="relation-label">
                        ({describeRelation(player.relations?.media ?? 50)})
                      </span>
                    </span>
                    <Bar value={player.relations?.media ?? 50} />
                    <Delta change={lastDelta?.relationsChange?.media ?? 0} />
                  </div>
                </div>
              </>
            )}
          </aside>

          <section className="story">
            <h2>{scene.title}</h2>
            <p className="story-text">{scene.text}</p>

            {lastTestResult && (
              <div
                className={`test-result ${
                  lastTestResult.success
                    ? "test-result--success"
                    : "test-result--fail"
                }`}
              >
                <p>
                  <strong>{lastTestResult.description}</strong>
                </p>
                <p>
                  d20: {lastTestResult.roll} + atributo (
                  {lastTestResult.attributeValue}) = {lastTestResult.total}
                </p>
                <p>
                  {lastTestResult.isCritSuccess
                    ? "Sucesso crítico!"
                    : lastTestResult.isCritFail
                    ? "Falha crítica..."
                    : lastTestResult.success
                    ? "Jogada bem sucedida."
                    : "Jogada falhada."}
                </p>
              </div>
            )}

            {/* Caixa de texto para decisões livres – só nas cenas com intents */}
            {scene.intents && (
              <div className="free-action">
                <label htmlFor="free-action-input">
                  Escreve o que queres fazer nesta jogada:
                </label>
                <textarea
                  id="free-action-input"
                  rows={2}
                  value={freeActionText}
                  onChange={(e) => setFreeActionText(e.target.value)}
                  placeholder='Ex.: "Remato em força ao canto", "Tento driblar o defesa", "Faço o passe seguro".'
                />
                <button
                  type="button"
                  className="free-action-button"
                  onClick={handleFreeActionSubmit}
                >
                  Confirmar decisão
                </button>
                {freeActionFeedback && (
                  <p className="free-action-feedback">
                    {freeActionFeedback}
                  </p>
                )}
                <p className="free-action-hint">
                  Dica: usa verbos simples como rematar, driblar, passar.
                </p>
              </div>
            )}

            {/* Sugestões rápidas (antigos botões) */}
            {scene.options && scene.options.length > 0 && (
              <>
                <h3 className="options-title">Sugestões rápidas</h3>
                <div className="options">
                  {scene.options.map((option) => (
                    <button
                      key={option.id}
                      className="option-button"
                      onClick={() => handleOptionClick(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

function runTest(test, player) {
  const roll = Math.floor(Math.random() * 20) + 1;
  const attrName = test.attribute;
  const attributeValue = player.attributes?.[attrName] ?? 0;
  const total = roll + attributeValue;
  const success = total >= test.dc;
  const isCritSuccess = roll === 20;
  const isCritFail = roll === 1;

  return { roll, total, attributeValue, success, isCritSuccess, isCritFail };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function describeRelation(value) {
  if (value >= 80) return "Excelente";
  if (value >= 60) return "Boa";
  if (value >= 40) return "Neutra";
  if (value >= 20) return "Fraca";
  return "Péssima";
}

function xpForNext(level) {
  return 100 + (level - 1) * 50;
}

function applyXp(player, xpGain) {
  if (!xpGain || xpGain === 0) return player;

  let level = player.level ?? 1;
  let xp = (player.xp ?? 0) + xpGain;

  let xpNeeded = xpForNext(level);

  while (xp >= xpNeeded) {
    xp -= xpNeeded;
    level += 1;
    xpNeeded = xpForNext(level);
  }

  return { ...player, level, xp };
}

// Escolhe a intent com MAIS palavras-chave que aparecem no texto
function findIntentForText(scene, text) {
  if (!scene || !Array.isArray(scene.intents)) return null;
  const normalized = text.toLowerCase();

  let bestIntent = null;
  let bestScore = 0;

  for (const intent of scene.intents) {
    if (!intent.keywords || intent.keywords.length === 0) continue;

    let score = 0;
    for (const kw of intent.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  if (bestScore === 0) return null;
  return bestIntent;
}

function Bar({ value }) {
  const pct = clamp(value ?? 0, 0, 100);
  return (
    <div className="bar">
      <div className="bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Delta({ change }) {
  if (!change || change === 0) return null;
  const sign = change > 0 ? "+" : "";
  const className =
    change > 0 ? "delta delta--pos" : "delta delta--neg";

  return <span className={className}>{sign}{change}</span>;
}

export default App;
