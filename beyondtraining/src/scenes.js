// src/scenes.js
import { INTENTS } from "./intentsDictionary";

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
        relationEffects: {
          coach: +5,
          team: +2
        },
        personalityEffects: {
          profissionalismo: +5,
          humildade: -5,
          equipa: +2,
          calma: -2
        },
        xp: 10
      },
      {
        id: "ficar_calado",
        label: "Fico calado e limito-me a acenar com a cabeça.",
        next: "calado",
        effects: { morale: -5 },
        relationEffects: {
          coach: -2
        },
        personalityEffects: {
          humildade: +6,
          calma: +3,
          profissionalismo: +1
        },
        xp: 5
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
        next: "entrada_campo",
        personalityEffects: {
          equipa: +2
        },
        xp: 5
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
        next: "entrada_campo",
        personalityEffects: {
          equipa: -1,
          humildade: +2
        },
        xp: 5
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
        next: "primeira_chance",
        effects: { stamina: -5 },
        personalityEffects: {
          calma: +4,
          profissionalismo: +3
        },
        xp: 5
      },
      {
        id: "olhar_bancada",
        label: "Procurar a tua família na bancada e acenar discretamente.",
        next: "primeira_chance",
        effects: { morale: +5 },
        relationEffects: {
          fans: +3
        },
        personalityEffects: {
          equipa: +1,
          calma: -2
        },
        xp: 5
      }
    ]
  },

  primeira_chance: {
    title: "Primeira Oportunidade",
    text: "Ainda na primeira parte, a bola sobra para ti à entrada da área. Tens espaço durante um segundo, antes de o defesa fechar.",
    // Sugestões rápidas (apenas 3 botões)
    options: [
      {
        id: "rematar_baliza",
        label: "Armas o remate colocado ao canto.",
        test: {
          attribute: "remate",
          dc: 14,
          description: "Remate à entrada da área"
        },
        nextOnSuccess: "remate_sucesso",
        nextOnFailure: "remate_falha",
        personalityEffects: {
          profissionalismo: +2,
          equipa: -1
        },
        xp: 20
      },
      {
        id: "driblar_defesa_botao",
        label: "Tentar driblar o defesa e ir para dentro.",
        test: {
          attribute: "drible",
          dc: 13,
          description: "Drible ao defesa"
        },
        nextOnSuccess: "drible_sucesso",
        nextOnFailure: "drible_falha",
        personalityEffects: {
          ego: 0, // ignorado, só exemplo se quiseres mais tarde
          equipa: -1,
          calma: -2
        },
        xp: 20
      },
      {
        id: "passe_seguro_botao",
        label: "Jogar pelo seguro e soltar no colega melhor posicionado.",
        next: "fim_demo",
        effects: { morale: -2 },
        relationEffects: {
          team: +4,
          fans: -2
        },
        personalityEffects: {
          equipa: +4,
          humildade: +2
        },
        xp: 15
      }
    ],
    // 10 intents completas, vindas do dicionário
    intents: INTENTS.chance_finalizacao
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
        relationEffects: {
          coach: +4,
          fans: +8,
          media: +5
        },
        personalityEffects: {
          calma: +2,
          equipa: +2
        },
        xp: 30
      }
    ]
  },

  remate_falha: {
    title: "Quase...",
    text: "Acertas mal na bola e ela sobe demais, a rasar a barra. Ouves um murmurinho na bancada, mas também alguns aplausos de incentivo.",
    options: [
      {
        id: "seguir_fim_falha",
        label:
          "Bater no peito, levantar a mão e prometer a ti próprio fazer melhor.",
        next: "fim_demo",
        effects: { morale: +2, stamina: -5 },
        relationEffects: {
          fans: +1,
          coach: -1
        },
        personalityEffects: {
          calma: +1,
          profissionalismo: +2
        },
        xp: 20
      }
    ]
  },

  drible_sucesso: {
    title: "Defesa Ficou para Trás",
    text: "Levas a bola colada ao pé, finges ir para fora, cortas para dentro e deixas o defesa sentado. O estádio levanta-se com um ‘oooooh’.",
    options: [
      {
        id: "drible_sucesso_continua",
        label: "Aproveitar o embalo e seguir a jogada.",
        next: "fim_demo",
        effects: { morale: +8, stamina: -3 },
        relationEffects: {
          team: +5,
          fans: +6,
          coach: +2
        },
        personalityEffects: {
          humildade: -3,
          equipa: +1
        },
        xp: 25
      }
    ]
  },

  drible_falha: {
    title: "Perda de Bola",
    text: "Tentaste a finta, mas o defesa lê bem o lance e rouba-te a bola. Sentes um misto de frustração e teimosia a ferver por dentro.",
    options: [
      {
        id: "drible_falha_reacao",
        label:
          "Recuperar posição rapidamente e tentar compensar na defesa.",
        next: "fim_demo",
        effects: { stamina: -5 },
        relationEffects: {
          coach: +1,
          fans: -2
        },
        personalityEffects: {
          equipa: +2,
          calma: +1
        },
        xp: 15
      }
    ]
  },

  fim_demo: {
    title: "Fim do jogo",
    text: "O árbitro apita para o final. Mais uma página escrita na tua carreira. Amanhã já se pensa na próxima semana.",
    options: [
      {
        id: "ir_para_semana",
        label: "Ir para a semana seguinte.",
        goToWeekHub: true,
        xp: 10
      }
    ]
  }
};
