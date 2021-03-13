require('dotenv/config');
const { CronJob } = require('cron');
const { Telegram } = require('telegraf');
const Parser = require('rss-parser');
const { constants } = require('fs');
const { access, writeFile, mkdir, appendFile, readFile } = require('fs/promises');

const { PROTOCOL_FILE_PATH, CHAT_ID_FILE_PATH } = require('./constants');

const writeChatIdProtocol = async id => {
  try {
    await access(CHAT_ID_FILE_PATH, constants.F_OK);

    const chatId = await readFile(CHAT_ID_FILE_PATH, { encoding: 'utf8' });

    if (chatId === '') {
      await appendFile(CHAT_ID_FILE_PATH, `${id}\n`)
    } else {
      return;
    }
  } catch (e) {
    await writeFile(CHAT_ID_FILE_PATH, '');
    await writeChatIdProtocol(id);
  }
}

const writeRSSProtocolStorage = async ({ url }) => {
  try {
    await access(PROTOCOL_FILE_PATH, constants.F_OK);

    await appendFile(PROTOCOL_FILE_PATH, `${url}\n`)
  } catch (e) {
    await mkdir(PROTOCOL_FILE_PATH.split('/protocol.txt')[0]);
    await writeFile(PROTOCOL_FILE_PATH, '');
    await writeRSSProtocolStorage({ url });
  }
};

const handleRSSXMLFeed = async url => {
  const parser = new Parser();

  const feed = await parser.parseURL(url);
  return feed;
}

const getMessageTemplate = ({ feedTitle, item }) =>
  `<strong>${feedTitle}</strong>\n` +
  `<a href="${item.link}">${item.title}</a>\n`;


// TODO: PLEASE REFACTORING THIS SHITTY FUNCTION
const readProtocolOnStart = async () => {
  try {
    await access(PROTOCOL_FILE_PATH, constants.F_OK);

    const protocolFile = await readFile(PROTOCOL_FILE_PATH, { encoding: 'UTF8' });
    const urlsStoragedOnProtocol = protocolFile
      .split('\n')
      .filter(url => url !== '');

    urlsStoragedOnProtocol.forEach(url => {
      console.log('added: %s', url);
      const bot = new Telegram(process.env.TELEGRAM_BOT_TOKEN);

      new CronJob('0 * * * *', async () => {
        const feed = await handleRSSXMLFeed(url);
        const chatId = await readFile(CHAT_ID_FILE_PATH, { encoding: 'utf8' })
        feed.items.forEach(item => {
          bot.sendMessage(
            chatId,
            getMessageTemplate({ feedTitle: feed.title, item }),
            { parse_mode: 'HTML' }
          );
        });
      }).start();
    })

  } catch(e) {}
};


module.exports = {
  writeRSSProtocolStorage,
  writeChatIdProtocol,
  handleRSSXMLFeed,
  getMessageTemplate,
  readProtocolOnStart,
}