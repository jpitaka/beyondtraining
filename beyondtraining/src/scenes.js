export const scenes = {
  inicio: {
    title: "Balneário – Jornada 1",
    text: "É o teu primeiro jogo oficial pelo Clube Continental. O balneário está em silêncio quando o treinador se vira para ti.",
    options: [
      {
        id: "responder_confiante",
        label: "Olho-o nos olhos: «Pode contar comigo hoje, mister.»",
        next: "confiante",
        effects: { morale: +10 },
      },
      {
        id: "ficar_calado",
        label: "Fico calado e limito-me a acenar com a cabeça.",
        next: "calado",
        effects: { morale: -5 },
      },
    ],
  },

  confiante: {
    title: "Confiança no ar",
    text: "Alguns colegas sorriem. O treinador bate-te no ombro com força.",
    options: [
      {
        id: "ir_para_campo",
        label: "Seguir para o túnel de acesso ao relvado.",
        next: "entrada_campo",
      },
    ],
  },

  calado: {
    title: "Silêncio",
    text: "Preferes não puxar dos galões. O treinador continua o discurso e passas despercebido.",
    options: [
      {
        id: "ir_para_campo2",
        label: "Seguir para o túnel de acesso ao relvado.",
        next: "entrada_campo",
      },
    ],
  },

  entrada_campo: {
    title: "Entrada em Campo",
    text: "O barulho do estádio cresce à medida que sobes as escadas do túnel. Sentes o coração a acelerar.",
    options: [
      {
        id: "focar_jogo",
        label: "Respirar fundo e focar só no jogo.",
        next: "primeira_chance",
        effects: { stamina: -5 },
      },
      {
        id: "olhar_bancada",
        label: "Procurar a tua família na bancada e acenar discretamente.",
        next: "primeira_chance",
        effects: { morale: +5 },
      },
    ],
  },

  primeira_chance: {
    title: "Primeira Oportunidade",
    text: "Ainda na primeira parte, a bola sobra para ti à entrada da área. Tens espaço durante um segundo, antes de o defesa fechar.",
    options: [
      {
        id: "rematar_baliza",
        label: "Armas o remate colocado ao canto.",
        test: {
          attribute: "remate",
          dc: 14,
          description: "Remate à entrada da área",
        },
        nextOnSuccess: "remate_sucesso",
        nextOnFailure: "remate_falha",
      },
      {
        id: "passe_seguro",
        label: "Jogar pelo seguro e soltar no colega melhor posicionado.",
        next: "fim_demo",
        effects: { morale: -2 },
      },
    ],
  },

  remate_sucesso: {
    title: "Golo!",
    text: "Acertas em cheio. A bola descreve um arco perfeito e entra junto ao poste. O estádio explode e sentes a confiança a disparar.",
    options: [
      {
        id: "seguir_fim",
        label: "Saborear o momento e voltar a focar no jogo.",
        next: "fim_demo",
        effects: { morale: +10 },
      },
    ],
  },

  remate_falha: {
    title: "Quase...",
    text: "Acertas mal na bola e ela sobe demais, a rasar a barra. Ouves um murmurinho na bancada, mas também alguns aplausos de incentivo.",
    options: [
      {
        id: "seguir_fim_falha",
        label: "Bater no peito, levantar a mão e prometer a ti próprio fazer melhor.",
        next: "fim_demo",
        effects: { morale: +2, stamina: -5 },
      },
    ],
  },

  fim_demo: {
    title: "Fim da mini-demo",
    text: "Aqui acaba esta primeira demo. O resto da história de Beyondtraining ainda está por escrever ✍️",
    options: [
      {
        id: "recomecar",
        label: "Recomeçar no balneário.",
        next: "inicio",
      },
    ],
  },
};
