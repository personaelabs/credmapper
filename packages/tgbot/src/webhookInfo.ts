import bot from '@/src/bot';
const getWebhookInfo = async () => {
  const webhookInfo = await bot.telegram.getWebhookInfo();
  console.log(webhookInfo);
};

getWebhookInfo();
