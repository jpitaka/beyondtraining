import { useState } from "react";
import "./App.css";
import { scenes } from "./scenes";

const BACKSTORIES = [
  {
    id: "diamante",
    title: "Diamante do Bairro",
    description:
      "Cresceste a jogar nas ruas e ringues do bairro. Toda a gente te conhece desde miúdo.",
    effectsText: "+ Moral inicial, menos pressão mediática.",
  },
  {
    id: "academia",
    title: "Filho da Academia",
    description:
      "Entraste cedo na formação do clube. És “produto da casa” e toda a estrutura sabe quem és.",
    effectsText:
      "+ Relação inicial com o treinador / direcção, expectativas internas mais altas.",
  },
  {
    id: "importacao",
    title: "Importação Estrangeira",
    description:
      "Vieste de outro país para tentar a sorte. Chegas como aposta de alguém lá em cima.",
    effectsText: "+ Técnica inicial, adaptação cultural mais difícil.",
  },
  {
    id: "veterano",
    title: "Veterano Tardio",
    description:
      "Andaste anos em equipas pequenas ou noutra profissão. Agora tens a tua última oportunidade.",
    effectsText: "+ Atributos mentais, - Atributos físicos iniciais.",
  },
];

const POSICOES = [
  "Médio Ofensivo (Maestro)",
  "Avançado Centro (Matador)",
  "Defesa Central (Muralha)",
  "Guarda-redes (Guardião)",
];

const BASE_STATS_POR_POSICAO = {
  "Médio Ofensivo (Maestro)": {
    remate: 5,
    passe: 7,
    drible: 7,
    velocidade: 5,
    resistencia: 5,
    compostura: 6,
  },
  "Avançado Centro (Matador)": {
    remate: 8,
    passe: 4,
    drible: 5,
    velocidade: 6,
    resistencia: 5,
    compostura: 5,
  },
  "Defesa Central (Muralha)": {
    remate: 3,
    passe: 4,
    drible: 3,
    velocidade: 4,
    resistencia: 7,
    compostura: 7,
  },
  "Guarda-redes (Guardião)": {
    remate: 2,
    passe: 4,
    drible: 2,
    velocidade: 4,
    resistencia: 7,
    compostura: 8,
  },
  default: {
    remate: 4,
    passe: 4,
    drible: 4,
    velocidade: 4,
    resistencia: 4,
    compostura: 4,
  },
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
  };
}

function App() {
  const [screen, setScreen] = useState("characterCreation");
  const [currentSceneId, setCurrentSceneId] = useState("inicio");

  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    position: POSICOES[0],
    club: "Clube Continental",
    backstory: "diamante",
  });

  const [player, setPlayer] = useState(null);
  const [lastTestResult, setLastTestResult] = useState(null);

  const scene = scenes[currentSceneId];

  const handleOptionClick = (option) => {
    if (!player) return;

    let testResult = null;

    if (option.test) {
      testResult = runTest(option.test, player);
      setLastTestResult({
        ...testResult,
        description: option.test.description || "Lance importante",
        attribute: option.test.attribute,
      });
    } else {
      setLastTestResult(null);
    }

    setPlayer((prev) => {
      if (!prev) return prev;

      if (option.reset) return prev;

      const effects = option.effects || {};
      const morale = clamp(prev.morale + (effects.morale ?? 0), 0, 100);
      const stamina = clamp(prev.stamina + (effects.stamina ?? 0), 0, 100);

      return { ...prev, morale, stamina };
    });

    let nextId = option.next ?? currentSceneId;

    if (option.test && testResult) {
      if (testResult.success) {
        nextId = option.nextOnSuccess ?? option.next ?? currentSceneId;
      } else {
        nextId = option.nextOnFailure ?? option.next ?? currentSceneId;
      }
    }

    setCurrentSceneId(nextId);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreatePlayer = (event) => {
    event.preventDefault();

    const novoJogador = criarJogadorInicial(formData);
    setPlayer(novoJogador);
    setCurrentSceneId("inicio");
    setScreen("game");
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Beyondtraining</h1>

        {player && (
          <div className="status-bar">
            <span>Condição Física: {player.stamina}</span>
            <span>Moral: {player.morale}</span>
          </div>
        )}
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
                  {lastTestResult.attributeValue}) ={" "}
                  {lastTestResult.total}
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

export default App;
