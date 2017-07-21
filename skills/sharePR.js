module.exports = function(skill, info, bot, message, db) {
    bot.api.users.info({user: message.user}, (error, response) => {
    let {name, real_name} = response.user;

    var userData = message.text.match(/\<(.*?)\>/g);

    console.log('messaage text: ' + message.text);
    console.log('userdata' + userData);
  if (userData) {
    for (var i = 0, len = userData.length; i < len; i++) {
        PRUser(userData[i].replace(/[^\w\s]/gi, ''));
        //console.log('userdate[i]' + userData[i]);
        //console.log('userdate[i]' + userData[i].replace(/[^\w\s]/gi, ''));
    }  
    //console.log(userData);
    bot.reply(message,'a presentation has been sent! :sunglasses:');
  } else {
    bot.reply(message, 'You didn\'t name anyone that needed a DFM presentation ' + name + '?');
  }

function PRUser(user) {
    bot.api.im.open({ user: user }, function (err, response) {
      if (err) {
        return console.log(err)
      }
    var prArray = [
    'https://giphy.com/gifs/eXTue7sCt6ZvG'
    ];
    var randomPR = Math.floor(Math.random()* prArray.length);    

    var dmChannel = response.channel.id
    bot.say({channel: dmChannel, text: 'Someone sent you a DFM presentation!'})
    bot.say({channel: dmChannel, text: prArray[randomPR]})
    })    
    
    
}
    
})

};
