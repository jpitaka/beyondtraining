export const scenes = {
  inicio: {
    title: "Balneário – Jornada 1",
    text: "É o teu primeiro jogo oficial pelo Clube Continental. O balneário está em silêncio quando o treinador se vira para ti.",
    options: [
      {
        id: "responder_confiante",
        label: "Olho-o nos olhos: «Pode contar comigo hoje, mister.»",
        next: "confiante",
        effects: { morale: +10 }
      },
      {
        id: "ficar_calado",
        label: "Fico calado e limito-me a acenar com a cabeça.",
        next: "calado",
        effects: { morale: -5 }
      }
    ]
  },

  confiante: {
    title: "Confiança no ar",
    text: "Alguns colegas sorriem. O treinador bate-te no ombro com força.",
    options: [
      {
        id: "ir_para_campo",
        label: "Seguir para o túnel de acesso ao relvado.",
        next: "entrada_campo"
      }
    ]
  },

  calado: {
    title: "Silêncio",
    text: "Preferes não puxar dos galões. O treinador continua o discurso e passas despercebido.",
    options: [
      {
        id: "ir_para_campo2",
        label: "Seguir para o túnel de acesso ao relvado.",
        next: "entrada_campo"
      }
    ]
  },

  entrada_campo: {
    title: "Entrada em Campo",
    text: "O barulho do estádio cresce à medida que sobes as escadas do túnel. Sentes o coração a acelerar.",
    options: [
      {
        id: "focar_jogo",
        label: "Respirar fundo e focar só no jogo.",
        next: "fim_demo",
        effects: { stamina: -5 }
      },
      {
        id: "olhar_bancada",
        label: "Procurar a tua família na bancada.",
        next: "fim_demo",
        effects: { morale: +5 }
      }
    ]
  },

  fim_demo: {
    title: "Fim da mini-demo",
    text: "Aqui acaba esta primeira demo. O resto da história de Beyondtraining ainda está por escrever ✍️",
    options: [
      {
        id: "recomecar",
        label: "Recomeçar no balneário.",
        next: "inicio",
        reset: true
      }
    ]
  }
};
