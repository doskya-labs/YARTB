require('dotenv').config();
const { Telegram } = require('telegraf');

const { handleRSSXMLFeed } = require('../utils');

const newsTemplateString = ({ feedTitle, item }) =>
  `<strong>${feedTitle}</strong>\n` +
  `<a href="${item.link}">${item.title}</a>\n`;

async function getFeed(ctx) {
  const feed = await handleRSSXMLFeed('https://hnrss.org/frontpage');

  feed.items.forEach(item => {
    new Telegram(process.env.TELEGRAM_BOT_TOKEN).sendMessage(
      ctx.message.chat.id,
      newsTemplateString({ feedTitle: feed.title, item }),
      { parse_mode: 'HTML' }
    );
  });
}

module.exports = getFeed;
