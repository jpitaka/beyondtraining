// src/intentsDictionary.js

// Intents genéricos que podem ser reutilizados em várias cenas.
// Aqui estamos a focar no tipo "chance_finalizacao" (remate/drible/passe).

export const INTENTS = {
  chance_finalizacao: [
    {
      id: "remate_colocado",
      label: "Remate colocado ao canto",
      keywords: [
        "remato",
        "rematar",
        "remate",
        "chuto",
        "chutar",
        "disparo",
        "remato ao canto",
        "remato colocado",
        "colocado",
        "em jeito",
        "bola em arco",
        "fazer o golo",
        "meter na gaveta",
        "coloco na gaveta",
        "tiro ao canto",
        "remate cruzado",
        "remato cruzado",
        "remato em jeito",
        "bola ao poste",
        "coloco no poste"
      ],
      test: {
        attribute: "remate",
        dc: 14,
        description: "Remate colocado à entrada da área"
      },
      nextOnSuccess: "remate_sucesso",
      nextOnFailure: "remate_falha",
      xp: 20
    },
    {
      id: "remate_potente",
      label: "Bomba em força",
      keywords: [
        "bomba",
        "balázio",
        "tiro forte",
        "remato forte",
        "remate forte",
        "chuto com força",
        "pancada na bola",
        "foguete",
        "canhão",
        "remato com tudo",
        "tiro de longe",
        "vou à bomba",
        "mandar um míssil",
        "rematar fortíssimo",
        "pontapé canhão",
        "fuzilo a baliza",
        "remato sem dó",
        "disparo forte",
        "pontapé forte",
        "biqueirada"
      ],
      test: {
        attribute: "remate",
        dc: 14,
        description: "Remate potente à entrada da área"
      },
      nextOnSuccess: "remate_sucesso",
      nextOnFailure: "remate_falha",
      xp: 20
    },
    {
      id: "remate_primeira",
      label: "Remate de primeira",
      keywords: [
        "remato de primeira",
        "primeira",
        "sem dominar",
        "sem parar a bola",
        "de voleio",
        "voleio",
        "meia volta",
        "de primeira intenção",
        "bato de primeira",
        "não deixo cair",
        "remato logo",
        "remate instantâneo",
        "remate de primeira intenção",
        "remato sem pensar",
        "chuto de primeira",
        "disparo de primeira",
        "tiro de primeira",
        "remato no primeiro toque",
        "primeiro toque",
        "de primeira ao golo"
      ],
      test: {
        attribute: "remate",
        dc: 14,
        description: "Remate de primeira à entrada da área"
      },
      nextOnSuccess: "remate_sucesso",
      nextOnFailure: "remate_falha",
      xp: 22
    },
    {
      id: "remate_longe",
      label: "Remate de longe",
      keywords: [
        "remato de longe",
        "remate de longe",
        "chuto de fora",
        "de fora da área",
        "tiro de longe",
        "bico de longe",
        "arrisco de longe",
        "remate de meia distância",
        "meia distância",
        "chuto lá de trás",
        "disparo de fora",
        "mandar um balázio de longe",
        "remato de muito longe",
        "remato ainda fora",
        "tiro de fora da área",
        "remate longínquo",
        "remate à baliza de longe",
        "remato lá de trás",
        "bombardeio de fora",
        "pontapé de longe"
      ],
      test: {
        attribute: "remate",
        dc: 15,
        description: "Remate de longe"
      },
      nextOnSuccess: "remate_sucesso",
      nextOnFailure: "remate_falha",
      xp: 25
    },
    {
      id: "drible_para_dentro",
      label: "Drible para dentro",
      keywords: [
        "driblo",
        "driblar",
        "finto",
        "fintar",
        "vou para dentro",
        "corto para dentro",
        "entrar para dentro",
        "faço a finta",
        "vou no 1x1",
        "um contra um",
        "levar a bola para dentro",
        "vou para cima dele",
        "tento passar por dentro",
        "tento passar o defesa",
        "drible curto",
        "finta curta",
        "faço uma finta",
        "vou no drible",
        "partir para cima",
        "dou um toque para dentro"
      ],
      test: {
        attribute: "drible",
        dc: 13,
        description: "Drible para dentro"
      },
      nextOnSuccess: "drible_sucesso",
      nextOnFailure: "drible_falha",
      xp: 20
    },
    {
      id: "drible_para_linha",
      label: "Drible para a linha e cruzar",
      keywords: [
        "vou à linha",
        "ir à linha",
        "linha de fundo",
        "vou até à linha",
        "fugir pela ala",
        "explorar a ala",
        "vou pela linha",
        "arranco pela linha",
        "vou em velocidade para a linha",
        "tentar ir à bandeirola",
        "procurar a linha",
        "ganhar a linha",
        "driblo para a linha",
        "finto para a linha",
        "vou para a bandeirola de canto",
        "ganho a linha e cruzo",
        "preparar cruzamento",
        "ir pelo lado",
        "desmarcar-me pela linha",
        "sprint pela ala"
      ],
      test: {
        attribute: "drible",
        dc: 13,
        description: "Drible para a linha"
      },
      nextOnSuccess: "drible_sucesso",
      nextOnFailure: "drible_falha",
      xp: 20
    },
    {
      id: "passe_seguro",
      label: "Passe seguro ao colega",
      keywords: [
        "passe",
        "passo",
        "passar a bola",
        "toque curto",
        "toco curto",
        "solto a bola",
        "jogar pelo seguro",
        "jogo simples",
        "passe simples",
        "passe curto",
        "entrego no colega",
        "toco para o lado",
        "jogo no colega livre",
        "meto no médio",
        "meto no avançado",
        "jogo seguro",
        "manter posse",
        "jogo fácil",
        "não arrisco",
        "procuro o passe fácil"
      ],
      next: "fim_demo",
      effects: { morale: -2 },
      relationEffects: {
        team: +4,
        fans: -2
      },
      xp: 15
    },
    {
      id: "passe_risco",
      label: "Passe arriscado de rotura",
      keywords: [
        "passe de rotura",
        "passe de ruptura",
        "meter na desmarcação",
        "meto nas costas da defesa",
        "bola nas costas",
        "enfiar uma bola",
        "passe vertical",
        "passe arriscado",
        "passe perigoso",
        "mandar um passe entre linhas",
        "passe para isolar",
        "meter o avançado na cara do golo",
        "meter bola em profundidade",
        "enfiar a bola no espaço",
        "passe entre centrais",
        "passe tenso",
        "passe rasgado",
        "mandar uma trivelada para o colega",
        "passe longo rasteiro",
        "passe a rasgar"
      ],
      next: "fim_demo",
      effects: { morale: +1 },
      relationEffects: {
        team: +2,
        fans: +3
      },
      xp: 18
    },
    {
      id: "segurar_bola",
      label: "Segurar a bola e esperar apoios",
      keywords: [
        "seguro a bola",
        "segurar a bola",
        "prendo a bola",
        "paro a jogada",
        "abrandar",
        "esperar apoios",
        "travão",
        "proteger a bola",
        "encostar o corpo",
        "rodar sobre mim",
        "virar para trás",
        "baixar o ritmo",
        "calmar o jogo",
        "pausar a jogada",
        "espero que subam",
        "esperar que a equipa suba",
        "jogar com calma",
        "guardar a bola",
        "não apressar",
        "resguardar a bola"
      ],
      next: "fim_demo",
      effects: { morale: 0 },
      relationEffects: {
        coach: +2,
        fans: -1
      },
      xp: 12
    },
    {
      id: "recuar_bola",
      label: "Recuar a bola para trás",
      keywords: [
        "recuo a bola",
        "recuar a bola",
        "jogar atrás",
        "passe para trás",
        "toco atrás",
        "voltar a jogar atrás",
        "recuar para o defesa",
        "recuar para o médio",
        "recuperar a forma",
        "voltar a construir",
        "jogar com o lateral",
        "voltar ao guarda-redes",
        "meter no guarda-redes",
        "tirar pressão",
        "aliviar pressão",
        "não arrisco e recuo",
        "passe de segurança para trás",
        "lá atrás está seguro",
        "começar de novo",
        "recomeçar atrás"
      ],
      next: "fim_demo",
      effects: { morale: -1 },
      relationEffects: {
        coach: +3,
        fans: -2
      },
      xp: 10
    }
  ]
};
