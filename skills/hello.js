module.exports = function(skill, info, bot, message, db) {
    var hiArray = require('./hello.json');
    var randomHi = Math.floor(Math.random()*hiArray.length);   
    bot.reply(message, hiArray[randomHi]);
};
