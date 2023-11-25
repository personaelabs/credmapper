import prisma from './prisma';

const WEIGHTS = {
  replies: 1,
  recasts: 1,
  likes: 1,
  timestamp: 86400 * 2,
};

const CRED_WEIGHTS: { [key: string]: number } = {
  'eth-mainnet_over100Txs': 1,
  'opt-mainnet_over100Txs': 1,
  'base-mainnet_over100Txs': 1,
};

export const assignScores = async () => {
  const casts = await prisma.packagedCast.findMany({
    select: {
      id: true,
      timestamp: true,
      repliesCount: true,
      recastsCount: true,
      likesCount: true,
      user: {
        select: {
          UserCred: {
            select: {
              cred: true,
            },
          },
        },
      },
    },
  });

  const scoredCasts = casts
    .map((c) => {
      let score = 0;
      score += Number(c.repliesCount) * WEIGHTS.replies;
      score += Number(c.recastsCount) * WEIGHTS.recasts;
      score += Number(c.likesCount) * WEIGHTS.likes;

      const elapsedTime = new Date().getTime() / 1000 - new Date(c.timestamp).getTime() / 1000;
      score += WEIGHTS.timestamp / elapsedTime;

      c.user.UserCred.forEach((uc) => {
        score += CRED_WEIGHTS[uc.cred];
      });

      return {
        ...c,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  for (const cast of scoredCasts) {
    await prisma.packagedCast.update({
      where: {
        id: cast.id,
      },
      data: {
        score: cast.score,
      },
    });
  }
};
