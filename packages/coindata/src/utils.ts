import etherscan from './etherscan';

export const findBlockNumberByTimestamp = async (targetDate: Date): Promise<bigint> => {
  const { data } = await etherscan.get('', {
    params: {
      module: 'block',
      action: 'getblocknobytime',
      timestamp: targetDate.getTime() / 1000,
      closest: 'before',
    },
  });

  return BigInt(data.result as string);
};
