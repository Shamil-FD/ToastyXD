const { model, Schema } = require('mongoose');

let schema = Schema({
  user: String,
  onLeave: Boolean,
  strikes: Number,
  infoCard: {
    desc: String,
    borders: String,
    background: String,
    text: String,
    img: String,
  },
  msgInfo: {
    today: Number,
    dailyCount: Number,
    total: Number,
    randomCount: Number,
    dailyMsgs: [Number],
  },
});

exports.staff = model('staff', schema);

schema = Schema({
  user: String,
  reason: String,
  date: String,
  count: Number,
  pings: [{ type: String }],
});

exports.afk = model('afk', schema);

schema = Schema({
  word: String,
  action: String,
  wild: Boolean,
});

exports.blacklist = model('blacklist', schema);

schema = Schema({
  user: String,
  date: String,
  time: String,
  chnl: String,
  reason: String,
  mod: String,
});

exports.chnlmute = model('chnlmute', schema);

schema = Schema({
  user: String,
  code: String,
  count: Number,
  startedAt: String,
});

exports.verification = model('verify', schema);

schema = Schema({
  user: String,
  start: String,
  end: String,
  reason: String,
});

exports.leave = model('leave', schema);

schema = Schema({
    user: { 
        type: String,
        required: true
    },
    firstTime: { 
        type: Boolean,
        default: false,
    },
    timesLeft: {
        type: Number,
        default: 0
    },
    notes: [{ id: Number, date: String, content: String }]
})

exports.userProfile = model('userProfile', schema);

schema = Schema({
    name: String,
    content: String,
    files: [String]
});

exports.tag = model('tag', schema);

schema = Schema({
    phrases: [String]
});

exports.ignore = model('ignore', schema);

schema = Schema({
    messages: [{
        count: Number,
        staff: Number,
        total: Number,
        date: String
    }],    
});

exports.serverActivity = model('serverActivity', schema)