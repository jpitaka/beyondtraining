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

function criarJogadorInicial(formData) {
  // valores base
  let morale = 50;
  let stamina = 80;

  // pequenos bónus conforme a backstory (por enquanto só mexemos nestes dois)
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

  const scene = scenes[currentSceneId];

  const handleOptionClick = (option) => {
    if (!player) return; // segurança, não deve acontecer

    setPlayer((prev) => {
      if (option.reset) return prev; // mais tarde podemos usar isto para reset total

      const effects = option.effects || {};
      const morale = clamp(prev.morale + (effects.morale ?? 0), 0, 100);
      const stamina = clamp(prev.stamina + (effects.stamina ?? 0), 0, 100);

      return { ...prev, morale, stamina };
    });

    setCurrentSceneId(option.next);
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
                        formData.backstory === b.id ? "backstory-card--active" : ""
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
              </>
            )}
          </aside>

          <section className="story">
            <h2>{scene.title}</h2>
            <p className="story-text">{scene.text}</p>

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default App;
