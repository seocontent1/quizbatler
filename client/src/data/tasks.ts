export const taskDefinitions = [
  {
    key: "correct_10",
    label: "Acerte 10 perguntas",
    required: 10,
    rewardBoosters: 3,
    rewardCoins: 0,
  },
  {
    key: "correct_100",
    label: "Acerte 100 perguntas",
    required: 100,
    rewardBoosters: 10,
    rewardCoins: 0,
  },
  {
    key: "correct_200",
    label: "Acerte 200 perguntas",
    required: 200,
    rewardBoosters: 0,
    rewardCoins: 200,
  },
  {
    key: "correct_300",
    label: "Acerte 300 perguntas",
    required: 300,
    rewardBoosters: 10,
    rewardCoins: 0,
  },
  {
    key: "correct_400",
    label: "Acerte 400 perguntas",
    required: 400,
    rewardBoosters: 0,
    rewardCoins: 400,
  },
  {
    key: "correct_1000",
    label: "Acerte 1000 perguntas",
    required: 1000,
    rewardBoosters: 130,
    rewardCoins: 0,
  },
  {
    key: "correct_2000",
    label: "Acerte 2000 perguntas",
    required: 2000,
    rewardBoosters: 2000,
    rewardCoins: 0,
  },
  {
    key: "correct_3000",
    label: "Acerte 3000 perguntas",
    required: 3000,
    rewardBoosters: 3000,
    rewardCoins: 0,
  },

  // Desafio especial
    {
      key: "perfect_10",
      label: "Acerte 10 perguntas seguidas no jogo",
      streakRequired: 10,
      rewardBoosters: 10,
      rewardCoins: 1000,
    },
];
