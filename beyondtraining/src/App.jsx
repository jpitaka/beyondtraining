import { useState } from "react";
import "./App.css";
import { scenes } from "./scenes";

const INITIAL_PLAYER = {
  name: 'José "Flash" Paul',
  position: "Médio Ofensivo",
  club: "Clube Continental",
  morale: 50,
  stamina: 80
};

function App() {
  const [currentSceneId, setCurrentSceneId] = useState("inicio");
  const [player, setPlayer] = useState(INITIAL_PLAYER);

  const scene = scenes[currentSceneId];

  const handleOptionClick = (option) => {
    setPlayer((prev) => {
      if (option.reset) return INITIAL_PLAYER;

      const effects = option.effects || {};
      const morale = clamp(prev.morale + (effects.morale ?? 0), 0, 100);
      const stamina = clamp(prev.stamina + (effects.stamina ?? 0), 0, 100);

      return { ...prev, morale, stamina };
    });

    setCurrentSceneId(option.next);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Beyondtraining</h1>
        <div className="status-bar">
          <span>Condição Física: {player.stamina}</span>
          <span>Moral: {player.morale}</span>
        </div>
      </header>

      <main className="content">
        <aside className="sidebar">
          <h2>Ficha do Jogador</h2>
          <p><strong>Nome:</strong> {player.name}</p>
          <p><strong>Posição:</strong> {player.position}</p>
          <p><strong>Clube:</strong> {player.club}</p>
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
    </div>
  );
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default App;
