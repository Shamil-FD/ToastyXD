const { token, dictionary, mongoUri } = require('./structure/Utility/Config');
const Toasty = require('./structure/Client');
const ToastyClient = new Toasty({ prefix: 't)', ownerID: ['484031943021690883', '450212014912962560'], testMode: false, staffReportChnl: '730101090267431012', adminRole: '655109748030439433', staffRole: '752632482943205546', staffManagerRole: '715946319734243440', notVerifiedRole: '801864058785628180', moderatorRole: '657615861372420097', mutedRole: '709401091799908433', devHelperRole: '809429613552861234', dictionary: dictionary, github: 'https://github.com/Shamil-FD/ToastyXD.git', tick: '✅', cross: '❌', arrow: '➤' });
  
ToastyClient.start(token, mongoUri);
