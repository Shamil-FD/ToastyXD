const Client = require('./Struct/Client');
const { Token, Mongo, Dictionary } = require('./Util/Config.js');

let client = new Client({
  StaffReportChnl: '730101090267431012',
  AdminRole: '655109748030439433',
  StaffRole: '752632482943205546',
  StaffManagerRole: '715946319734243440',
  NotVerifiedRole: '801864058785628180',
  MutedRole: '709401091799908433',
  ModeratorRole: '657615861372420097',
  DevHelperRole: '809429613552861234',
  Mongo: Mongo,
  Dictionary: Dictionary,
  Github: 'https://github.com/Shamil-FD/ToastyXD.git',
  tick: '✅',
  cross: '❌',
  arrow: '❯',
  prefix: 't)',
  testMode: false,
});
client.start({ Token });
