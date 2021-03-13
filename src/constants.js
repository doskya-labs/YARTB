const { join } = require('path');

module.exports = {
  PROTOCOL_FILE_PATH: join(__dirname, '..', 'storage', 'protocol.txt'),
  CHAT_ID_FILE_PATH: join(__dirname, '..', 'storage', 'chat-id.txt'),
}
