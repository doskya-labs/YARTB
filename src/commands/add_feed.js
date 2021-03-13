const { writeRSSProtocolStorage, writeChatIdProtocol } = require('../utils');

const COMMAND = '/add_rss';

async function addFeed(ctx) {
  const [url] = ctx.message.text
    .split(' ')
    .filter((string, idx) => string !== COMMAND && idx !== 0)

  await writeRSSProtocolStorage({ url });
  await writeChatIdProtocol(ctx.message.chat.id);
  
  cronEvent.emit('@rss/ADD_NEW_FEED', { url, chatId: ctx.message.chat.id });
}

module.exports = addFeed;
