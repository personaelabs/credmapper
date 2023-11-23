import 'dotenv/config';

const HOST_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://tg-bot-nu-seven.vercel.app'
    : 'http://localhost:3000';

const credMeta = [
  {
    id: 'over_100txs',
    name: '> 100txs',
    image: `${HOST_URL}/eth-diamond-black.svg`,
  },
];

export default credMeta;
