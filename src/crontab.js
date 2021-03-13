require('dotenv').config();
const { EventEmitter } = require('events');
const { CronJob } = require('cron');
const { Telegram } = require('telegraf');

const { handleRSSXMLFeed, getMessageTemplate } = require('./utils');

global.cronEvent = new EventEmitter();

const crontab = () => {
  cronEvent.on('@rss/ADD_NEW_FEED', ({ url, chatId }) => {
    console.log('Added new feed');
    new CronJob('0 * * * *', async () => {
      const feed = await handleRSSXMLFeed(url);
      feed.items.forEach(item => {
        new Telegram(process.env.TELEGRAM_BOT_TOKEN).sendMessage(
          chatId,
          getMessageTemplate({ feedTitle: feed.title, item }),
          { parse_mode: 'HTML' }
        );
      });
    }).start();
  });
}

module.exports = crontab;
