const { model, Schema } = require('mongoose');

let schema = Schema({
	mod: String,
	user: String,
	reason: String,
	date: String,
	id: Number,
});

exports.warn = model('warn', schema);

schema = Schema({
	user: String,
	reason: String,
	mod: String,
});

exports.unban = model('unban', schema);

schema = Schema({
	Count: Number,
});

exports.counts = model('counts', schema);

schema = Schema({
	num: Number,
});

exports.warnCount = model('warnCount', schema);

schema = Schema({
	user: String,
	msgs: Number,
	desc: String,
	dailyCount: Number,
	total: Number,
	onLeave: Boolean,
	strikes: Number,
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
	pos: Boolean,
});

exports.pos = model('pos', schema);

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
});

exports.verif = model('verify', schema);

schema = Schema({
	user: String,
	start: String,
	end: String,
	reason: String,
});

exports.leave = model('leave', schema);

schema = Schema({
	id: String,
	bal: Number,
	level: Number,
	bank: Number,
	items: [String],
});

exports.profile = model('profile', schema);
