require('dotenv').config();
const { Telegraf } = require('telegraf');

const commands = require('./commands');
const crontab = require('./crontab');
const { readProtocolOnStart } = require('./utils');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

(async () => {
  await readProtocolOnStart();
  console.log(bot.botInfo);

  Object
    .entries(commands)
    .forEach(([command, commandFn]) => bot.command(command, commandFn));

  crontab();
  await bot.launch();
})()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))