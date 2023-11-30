import prisma from './prisma';
import { batchRun } from './utils';

export const assignScores = async () => {
  const casts = await prisma.packagedCast.findMany({
    select: {
      id: true,
      timestamp: true,
      repliesCount: true,
      recastsCount: true,
      likesCount: true,
    },
  });

  const scoredCasts = casts
    .map((c) => {
      let score = 0;
      score += Number(c.likesCount);
      score += Number(c.recastsCount) * 2;
      score += Number(c.repliesCount) * 3;

      const elapsedHours = Math.round(
        (new Date().getTime() - new Date(c.timestamp).getTime()) / 1000 / 60 / 60,
      );
      const ageScore = 24 - elapsedHours;
      score += ageScore;

      return {
        ...c,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  await batchRun(
    async (batch) => {
      await Promise.all(
        batch.map(async (cast) => {
          try {
            await prisma.packagedCast.update({
              where: {
                id: cast.id,
              },
              data: {
                score: cast.score,
              },
            });
          } catch (err) {
            console.log('error updating cast score', cast);
            console.log(err);
          }
        }),
      );
    },
    scoredCasts,
    'Updating cast scores',
    50,
  );
};
