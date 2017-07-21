
module.exports = function(skill, info, bot, message, services) {
  console.log('INVOCATION OF NON-CONFIGURED SKILL: ' + skill);
  bot.reply(message, 'I understood this as `' + skill +
    '`, but you haven\'t configured how to make me work yet!');
};
