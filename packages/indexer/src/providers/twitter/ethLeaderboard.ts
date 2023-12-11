import axios from 'axios';
import { EthLeadersResponse } from '../../types';

export const getLeaders = async (
  skip: number,
  pageSize: number,
): Promise<EthLeadersResponse['frens']> => {
  const { data } = await axios.get<EthLeadersResponse>(`https://ethleaderboard.xyz/api/frens`, {
    params: {
      count: pageSize,
      skip,
    },
  });

  return data.frens;
};
