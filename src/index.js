const Client = require('./Struct/Client');
const { Token, Mongo } = require('./Util/Config.js');

let client = new Client({
  StaffReportChnl: '730101090267431012',
  AdminRole: '655109748030439433',
  StaffRole: '752632482943205546',
  StaffManagerRole: '715946319734243440',
  NotVerifiedRole: '801864058785628180',
  MutedRole: '709401091799908433',
  Mongo: Mongo,
  Github: 'https://github.com/Shamil-FD/ToastyXD.git',
  tick: '✅',
  cross: '❌',
  arrow: '❯',
  prefix: 't/',
});
client.start({ Token });
