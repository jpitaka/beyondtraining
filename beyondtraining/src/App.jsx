import { useState, useEffect } from "react";
import "./App.css";
import { scenes } from "./scenes";
import AttributeRadar from "./AttributeRadar";
import PlayerSidebar from "./PlayerSidebar";

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

function defaultPersonality() {
  return {
    profissionalismo: 50, // 0 = Boémio, 100 = Profissional
    fairplay: 50,        // 0 = Anti-jogo, 100 = Fair-play
    loyalty: 50,         // 0 = Mercenário, 100 = Leal ao clube
    humildade: 50,       // 0 = Ego elevado, 100 = Humilde
    equipa: 50,          // 0 = Individualista, 100 = Trabalho de equipa
    calma: 50            // 0 = Explosivo, 100 = Calmo
  };
}

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
    personality: defaultPersonality(),
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

  // stats do jogo actual + resumo do último jogo
  const [matchStats, setMatchStats] = useState({
    ratingDelta: 0,
    goals: 0,
    bigChancesMissed: 0,
    keyPasses: 0
  });
  const [lastMatchSummary, setLastMatchSummary] = useState(null);

  const [currentEvent, setCurrentEvent] = useState(null);
  const [eventWeek, setEventWeek] = useState(null);

  // estado do "dado"
  const [isRolling, setIsRolling] = useState(false);
  const [rollDisplay, setRollDisplay] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); // { option, testResult }

  const scene = scenes[currentSceneId];

  // carregar save
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const data = JSON.parse(raw);
      if (!data.player) return;

      // garantir que jogadores antigos recebem personalidade
      if (!data.player.personality) {
        data.player.personality = defaultPersonality();
      }

      setPlayer(data.player);
      setScreen(data.screen || "weekHub");
      setCurrentSceneId(data.currentSceneId || "inicio");
      setWeek(data.week || 1);
      setMatchStats(
        data.matchStats || {
          ratingDelta: 0,
          goals: 0,
          bigChancesMissed: 0,
          keyPasses: 0
        }
      );
      setLastMatchSummary(data.lastMatchSummary || null);
      setCurrentEvent(data.currentEvent || null);
      setEventWeek(data.eventWeek ?? null);
      setLastTestResult(null);
      setLastDelta(null);
      setFreeActionText("");
      setFreeActionFeedback("");
      setIsRolling(false);
      setRollDisplay(null);
      setPendingAction(null);
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
      week,
      matchStats,
      lastMatchSummary,
      currentEvent,
      eventWeek
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("Falha a guardar save:", err);
    }
  }, [player, screen, currentSceneId, week, matchStats, lastMatchSummary, currentEvent, eventWeek]);

  // animação do "dado" (números a rodar)
  useEffect(() => {
    if (!isRolling || !pendingAction) return;

    let ticks = 0;
    const maxTicks = 12; // podes afinar
    const interval = setInterval(() => {
      ticks++;
      if (ticks >= maxTicks) {
        clearInterval(interval);
        const final = pendingAction.testResult.roll;
        setRollDisplay(final);
        setTimeout(() => {
          finalizarRoll(pendingAction);
        }, 400);
      } else {
        const randomValue = Math.floor(Math.random() * 20) + 1;
        setRollDisplay(randomValue);
      }
    }, 110); // já está um pouco mais lento

    return () => clearInterval(interval);
  }, [isRolling, pendingAction]);

    useEffect(() => {
    if (!player) return;
    if (screen !== "weekHub") return;
    if (eventWeek === week) return; // esta semana já foi processada

    const event = generateWeeklyEvent(week, player);
    setCurrentEvent(event);
    setEventWeek(week);
  }, [screen, week, player, eventWeek]);

  const handleOptionClick = (option) => {
    if (!player || isRolling) return;

    // opções sem teste: aplicam logo
    if (!option.test) {
      aplicarConsequencias(option, null);
      return;
    }

    // opções com teste: começa animação de roll
    const testResult = runTest(option.test, player);
    setPendingAction({ option, testResult });
    setIsRolling(true);
    setRollDisplay(Math.floor(Math.random() * 20) + 1);
    setLastTestResult(null);
  };

  const finalizarRoll = (action) => {
    const { option, testResult } = action;

    const extendedResult = {
      ...testResult,
      description: option.test.description || "Lance importante",
      attribute: option.test.attribute
    };
    setLastTestResult(extendedResult);

    aplicarConsequencias(option, testResult);

    setIsRolling(false);
    setRollDisplay(null);
    setPendingAction(null);
  };

  function aplicarConsequencias(option, testResult) {
    if (!player) return;

    const effects = option.effects || {};
    const relationEffects = option.relationEffects || {};
    const personalityEffects = option.personalityEffects || {};
    const xpGain = option.xp ?? 0;
    const impact = option.matchImpact || {};
    const hadImpact =
      impact.ratingDelta ||
      impact.goals ||
      impact.bigChancesMissed ||
      impact.keyPasses;

    const newMatchStats = hadImpact
      ? {
          ratingDelta:
            (matchStats.ratingDelta || 0) + (impact.ratingDelta || 0),
          goals: (matchStats.goals || 0) + (impact.goals || 0),
          bigChancesMissed:
            (matchStats.bigChancesMissed || 0) +
            (impact.bigChancesMissed || 0),
          keyPasses:
            (matchStats.keyPasses || 0) + (impact.keyPasses || 0)
        }
      : matchStats;

    if (hadImpact) {
      setMatchStats(newMatchStats);
    }

    setPlayer((prev) => {
      if (!prev) return prev;
      if (option.reset) return prev;

      let updated = {
        ...prev,
        relations: { ...(prev.relations || {}) },
        personality: { ...(prev.personality || defaultPersonality()) }
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

            // personalidade
      for (const key of Object.keys(personalityEffects)) {
        if (!(key in updated.personality)) continue;
        const current = updated.personality[key] ?? 50;
        const change = personalityEffects[key];
        updated.personality[key] = clamp(current + change, 0, 100);
      }

      return updated;
    });

    setLastDelta({
      moraleChange: effects.morale ?? 0,
      staminaChange: effects.stamina ?? 0,
      relationsChange: relationEffects,
      personalityChange: personalityEffects,
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
      const resumo = criarResumoJogo(newMatchStats);
      setLastMatchSummary(resumo);

      setFreeActionText("");
      setFreeActionFeedback("");
      setCurrentSceneId("inicio");
      setScreen("weekHub");
      setWeek((prev) => prev + 1);
    } else {
      setCurrentSceneId(nextId);
    }
  }

  const handleFreeActionSubmit = () => {
    if (!player || isRolling) return;

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
    setMatchStats({
      ratingDelta: 0,
      goals: 0,
      bigChancesMissed: 0,
      keyPasses: 0
    });
    setLastMatchSummary(null);
    setCurrentEvent(null);
    setEventWeek(null);
    setLastTestResult(null);
    setLastDelta(null);
    setFreeActionText("");
    setFreeActionFeedback("");
    setIsRolling(false);
    setRollDisplay(null);
    setPendingAction(null);
    setScreen("weekHub");
  };

  const handleTrainingChoice = (type) => {
    if (!player || isRolling) return;

    let staminaChange = 0;
    let moraleChange = 0;
    let xpGain = 0;

    setPlayer((prev) => {
      if (!prev) return prev;

      let updated = {
        ...prev,
        attributes: { ...prev.attributes },
        relations: { ...(prev.relations || {}) },
        personality: { ...(prev.personality || defaultPersonality()) }
      };

      if (type === "fisico") {
        staminaChange = +10;
        moraleChange = -5;
        xpGain = 10;
        updated.stamina = clamp(prev.stamina + staminaChange, 0, 100);
        updated.morale = clamp(prev.morale + moraleChange, 0, 100);
        updated.attributes.resistencia = (prev.attributes.resistencia || 0) + 1;
        updated.personality.profissionalismo = clamp(
          (updated.personality.profissionalismo ?? 50) + 1,
          0,
          100
        );
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
        updated.personality.calma = clamp(
          (updated.personality.calma ?? 50) + 1,
          0,
          100
        );
      }

      updated = applyXp(updated, xpGain);

      return updated;
    });

    setLastTestResult(null);
    setLastDelta({
      moraleChange,
      staminaChange,
      relationsChange: {},
      personalityChange: {},
      xpChange: xpGain
    });

    setFreeActionText("");
    setFreeActionFeedback("");
    setMatchStats({
      ratingDelta: 0,
      goals: 0,
      bigChancesMissed: 0,
      keyPasses: 0
    });
    setCurrentEvent(null);

    setCurrentSceneId("inicio");
    setScreen("game");
  };

  const handleSocialOptionClick = (option) => {
    if (!player || isRolling || !currentEvent) return;

    // Reutilizamos a mesma função que aplica efeitos das cenas de jogo
    aplicarConsequencias(option, null);
    setCurrentEvent(null);
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
    setIsRolling(false);
    setRollDisplay(null);
    setPendingAction(null);
    setFormData({
      name: "",
      nickname: "",
      position: POSICOES[0],
      club: "Clube Continental",
      backstory: "diamante"
    });
    setMatchStats({
      ratingDelta: 0,
      goals: 0,
      bigChancesMissed: 0,
      keyPasses: 0
    });
    setLastMatchSummary(null);
    setCurrentEvent(null);
    setEventWeek(null);
  };

  const xpNeeded = player ? xpForNext(player.level ?? 1) : 0;
  const xpPct =
    player && xpNeeded
      ? clamp(((player.xp ?? 0) * 100) / xpNeeded, 0, 100)
      : 0;

  const renderSidebar = () => (
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

          <AttributeRadar attributes={player.attributes} />

          <p className="attr-inline">
            <span>
              Remate: <strong>{player.attributes.remate}</strong>
            </span>
            <span>
              Passe: <strong>{player.attributes.passe}</strong>
            </span>
          </p>
          <p className="attr-inline">
            <span>
              Drible: <strong>{player.attributes.drible}</strong>
            </span>
            <span>
              Velocidade: <strong>{player.attributes.velocidade}</strong>
            </span>
          </p>
          <p className="attr-inline">
            <span>
              Resistência: <strong>{player.attributes.resistencia}</strong>
            </span>
            <span>
              Compostura: <strong>{player.attributes.compostura}</strong>
            </span>
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
              <Delta change={lastDelta?.relationsChange?.coach ?? 0} />
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

          <hr className="sidebar-divider" />

          <h3>Personalidade</h3>

          <AxisRow
            label="Profissionalismo / Boémio"
            left="Boémio"
            right="Profissional"
            value={player.personality?.profissionalismo ?? 50}
          />
          <AxisRow
            label="Fair-play / Anti-jogo"
            left="Anti-jogo"
            right="Fair-play"
            value={player.personality?.fairplay ?? 50}
          />
          <AxisRow
            label="Lealdade ao clube / Mercenário"
            left="Mercenário"
            right="Leal ao clube"
            value={player.personality?.loyalty ?? 50}
          />
          <AxisRow
            label="Humildade / Ego"
            left="Ego"
            right="Humilde"
            value={player.personality?.humildade ?? 50}
          />
          <AxisRow
            label="Trabalho de equipa / Individualista"
            left="Individualista"
            right="Equipa"
            value={player.personality?.equipa ?? 50}
          />
          <AxisRow
            label="Calma / Temperamento explosivo"
            left="Explosivo"
            right="Calmo"
            value={player.personality?.calma ?? 50}
          />
        </>
      )}
    </aside>
  );

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

      {/* === SCREEN 1 – CRIAÇÃO DE PERSONAGEM (SEM SIDEBAR) === */}
      {screen === "characterCreation" && (
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
      )}

      {/* === SCREEN 2 – HUB SEMANAL (COM SIDEBAR) === */}
      {screen === "weekHub" && (
        <main className="content">
          {renderSidebar()}

          <section className="story">
            {lastMatchSummary && (
              <div className="creation-card last-match-card">
                <h2>Resumo do último jogo</h2>
                <p className="creation-subtitle">
                  Como foi a tua exibição na última partida.
                </p>

                <div className="last-match-main">
                  <div className="last-match-rating">
                    <span className="last-match-rating-value">
                      {lastMatchSummary.rating}
                    </span>
                    <span className="last-match-rating-label">Nota</span>
                  </div>

                  <div className="last-match-details">
                    <p>
                      <strong>Golos:</strong> {lastMatchSummary.goals}
                    </p>
                    <p>
                      <strong>Grandes oportunidades falhadas:</strong>{" "}
                      {lastMatchSummary.bigChancesMissed}
                    </p>
                    <p>
                      <strong>Passes-chave:</strong>{" "}
                      {lastMatchSummary.keyPasses}
                    </p>
                  </div>
                </div>

                <p className="last-match-comment">
                  {lastMatchSummary.comment}
                </p>
              </div>
            )}

            {currentEvent && (
              <div className="creation-card social-card">
                <h2>Evento da semana</h2>
                <p className="creation-subtitle">
                  Uma situação fora de campo que pode mudar a tua carreira.
                </p>

                <h3 className="social-title">{currentEvent.title}</h3>
                <p className="social-text">{currentEvent.text}</p>

                <div className="options">
                  {currentEvent.options.map((opt) => (
                    <button
                      key={opt.id}
                      className="option-button"
                      onClick={() => handleSocialOptionClick(opt)}
                      disabled={isRolling}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="creation-card week-card">
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
                  disabled={isRolling}
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
                  disabled={isRolling}
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
                  disabled={isRolling}
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
            </div>
          </section>
        </main>
      )}

      {/* === SCREEN 3 – JOGO (COM SIDEBAR) === */}
      {screen === "game" && (
        <main className="content">
          {renderSidebar()}

          <section className="story">
            <h2>{scene.title}</h2>
            <p className="story-text">{scene.text}</p>

            {isRolling && (
              <div className="roll-overlay">
                <div className="roll-box">
                  <div className="roll-label">Lançar d20...</div>
                  <div className="roll-number">
                    {rollDisplay ?? "?"}
                  </div>
                </div>
              </div>
            )}

            {lastTestResult && !isRolling && (
              <div
                className={`test-result ${getTestResultClass(
                  lastTestResult
                )}`}
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
                  disabled={isRolling}
                />
                <button
                  type="button"
                  className="free-action-button"
                  onClick={handleFreeActionSubmit}
                  disabled={isRolling}
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

            {scene.options && scene.options.length > 0 && (
              <>
                <h3 className="options-title">Sugestões rápidas</h3>
                <div className="options">
                  {scene.options.map((option) => (
                    <button
                      key={option.id}
                      className="option-button"
                      onClick={() => handleOptionClick(option)}
                      disabled={isRolling}
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
function criarResumoJogo(stats) {
  const base = 6; // nota base
  const ratingRaw = base + (stats.ratingDelta || 0);
  const rating = clamp(ratingRaw, 3, 10);

  let comment;

  if ((stats.goals || 0) >= 2) {
    comment = "Exibição de craque: decisivo com vários golos.";
  } else if (stats.goals === 1) {
    comment = "Bom jogo, coroado com um golo importante.";
  } else if ((stats.bigChancesMissed || 0) >= 1) {
    comment = "Jogo misto: apareceu bem, mas falhou uma grande oportunidade.";
  } else if ((stats.keyPasses || 0) >= 2) {
    comment =
      "Jogo muito útil, a criar várias jogadas perigosas para a equipa.";
  } else if ((stats.keyPasses || 0) === 1) {
    comment = "Jogo sólido, a ligar bem o jogo e a servir os colegas.";
  } else if ((stats.ratingDelta || 0) <= -2) {
    comment = "Dia difícil: pouco inspirado e com vários erros relevantes.";
  } else {
    comment = "Exibição razoável, sem grandes destaques.";
  }

  return {
    rating: rating.toFixed(1),
    goals: stats.goals || 0,
    bigChancesMissed: stats.bigChancesMissed || 0,
    keyPasses: stats.keyPasses || 0,
    comment
  };
}
function generateWeeklyEvent(week, player) {
  if (!player) return null;

  // Primeiro exemplo: evento aparece na Semana 2
  if (week === 2) {
    return {
      id: "convite_festa",
      title: "Convite para uma festa",
      text:
        "Depois do último jogo, alguns colegas mandam mensagem no grupo: estão a combinar uma festa grande para esta noite. Dizem que vai estar metade da cidade e que \"tens de aparecer\".",
      options: [
        {
          id: "ir_festa",
          label: "Aceitar o convite e ir à festa até tarde.",
          effects: { stamina: -10, morale: +8 },
          relationEffects: { team: +5, coach: -3 },
          personalityEffects: {
            profissionalismo: -5,
            humildade: -2,
            equipa: +2,
            calma: -2
          },
          xp: 5
        },
        {
          id: "ir_um_bocado",
          label: "Aparecer um bocado, socializar e sair cedo.",
          effects: { stamina: -3, morale: +3 },
          relationEffects: { team: +2 },
          personalityEffects: {
            profissionalismo: +2,
            equipa: +1,
            calma: +1
          },
          xp: 10
        },
        {
          id: "recusar",
          label: "Recusar e dizer que precisas de descansar para o próximo jogo.",
          effects: { stamina: +5, morale: -2 },
          relationEffects: { team: -4, coach: +2 },
          personalityEffects: {
            profissionalismo: +4,
            calma: +2
          },
          xp: 8
        }
      ]
    };
  }

  // Sem evento nas outras semanas (por agora)
  return null;
}

// escolhe a intent com mais keywords que batem
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

function getTestResultClass(result) {
  if (result.isCritSuccess) return "test-result--crit-success";
  if (result.isCritFail) return "test-result--crit-fail";
  if (result.success) return "test-result--normal-success";
  return "test-result--normal-fail";
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

function getAxisDescriptor(value) {
  const v = value ?? 50;

  if (v < 30) {
    return { type: "left", label: "Tendência esquerda" };
  }
  if (v > 70) {
    return { type: "right", label: "Tendência direita" };
  }
  return { type: "neutral", label: "Equilibrado" };
}

function AxisRow({ label, left, right, value }) {
  const pct = clamp(value ?? 50, 0, 100);
  const { type, label: tagLabel } = getAxisDescriptor(pct);

  return (
    <div className="axis-row">
      <div className="axis-header-line">
        <span className="axis-title">{label}</span>
        <span className={`axis-tag axis-tag--${type}`}>{tagLabel}</span>
      </div>
      <div className="axis-track">
        <span className="axis-end">{left}</span>
        <div className="axis-bar">
          <div className="axis-bar-fill" style={{ width: `${pct}%` }} />
          <div className="axis-handle" style={{ left: `${pct}%` }} />
        </div>
        <span className="axis-end">{right}</span>
      </div>
    </div>
  );
}


export default App;
