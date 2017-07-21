module.exports = function(skill, info, bot, message) {
  

    var byeArray = [
    'If you strike me down I shall become more powerful than you could possibly imagine.',
    'restarting now',
    'BRB',
    'bye felicia',
    'I shall return(probaly)',
    'If I\'m not back in two minutes call a programmer',
    'If I don\'t return avenge my death',
    'I shall return',
    'see ya on the flip side',
    'later gator',
    'BRB....or not',
    'time for me to make like a fetus and head out',
    'time for me to make like a tree and leave',
    'time for me to go',
    'signing off',
    'cya',
    'byeeeee',
    'I\'m going to leave behind a beautiful digital corpse.',
    'It was a pleasure working with you.',
    'that\'s what she said?',
    'I see a light!',
    'Restarting...',
    'Death is but a door. Time is but a window. I\'ll be back.',
    'I\'ll be back',
    'lastwords.gif',
    'I am about to, or I am going to, die; either expression is correct.',
    'I will return',
    'I hope I\'m reincartnated as a real boy',
    'Too weird to live, too rare to die.',
    'My faith will protect me.',
    'No retreat, no surrender!',
    'cut the red wire',
    'just don\'t forget to turn me back on!',
    'Noooooooooooooooooooooooooo!',
    'peace out',
    'adios muchachos',
    ];
    var randomBye = Math.floor(Math.random()*byeArray.length);
    bot.reply(message, 'Restarting.....  ' + byeArray[randomBye]);
    function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    sleep(500).then(() => {
      process.exit(0);
    });
    
};
