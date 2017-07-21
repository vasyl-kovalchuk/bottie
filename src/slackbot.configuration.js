
// Have a remote json config file for holding tokens. add this file to your gitignore.
var config = require('./config.json');
process.env.token = config.token;
process.env.clientId = config.clientId;
process.env.clientSecret = config.clientSecret;
process.env.port = config.port;

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./node_modules/botkit/lib/Botkit.js');
var os = require('os');
var express = require('express');
// Using a token to get user information. Generate a token here https://api.slack.com/docs/oauth-test-tokens
var userToken = config.userToken;

// Check for ENV variables - Required to be a slack app to use interactive buttons
if (!process.env.clientId || !process.env.clientSecret || !process.env.port) {
    console.log('Error: Specify clientId clientSecret and port in environment');
    process.exit(1);
}

// Sample controller config - REQUIRED FOR INTERACTIVE BUTTONS
var controller = Botkit.slackbot({
    debug: false,
    interactive_replies: true, // tells botkit to send button clicks into conversations
    json_file_store: './db_slackbutton_bot/',
}).configureSlackApp(
    {
        clientId: process.env.clientId,
        clientSecret: process.env.clientSecret,
        // Set scopes as needed. https://api.slack.com/docs/oauth-scopes
        scopes: ['bot','incoming-webhook','team:read','users:read','users.profile:read','channels:read','im:read','im:write','groups:read','emoji:read','chat:write:bot'],
    }
);

// Setup for the Webserver - REQUIRED FOR INTERACTIVE BUTTONS
controller.setupWebserver(process.env.port,function(err,webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver,function(err,req,res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});

// Method for when the bot is added to a team
controller.on('create_bot',function(bot,config) {
    if (_bots[bot.config.token]) {
        // already online! do nothing.
    } else {
        bot.startRTM(function(err) {
            if (!err) {
                trackBot(bot);
            }
            bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
                if (err) {
                    console.log(err);
                } else {
                    convo.say('I am a bot that has just joined your team');
                    convo.say('You must now /invite me to a channel so that I can be of use!');
                }
            });
        });
    }
});

// Handle events related to the websocket connection to Slack
controller.on('rtm_open',function(bot) {
    console.log('** The RTM api just connected!');
});

controller.on('rtm_close',function(bot) {
    console.log('** The RTM api just closed');
    // you may want to attempt to re-open
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
    _bots[bot.config.token] = bot;
}

// Controller to test the interative button setup
controller.hears(['test button'], 'direct_message,direct_mention,mention', function (bot, message) {
    var testButtonReply = {
        username: 'Button Bot' ,
        text: 'This is a test message with a button',
        replace_original: 'true',
        attachments: [
            {
                fallback: "fallback text",
                callback_id: '123',
                attachment_type: 'default',
                title: 'message title',
                text: 'message content',
                color: '#0075C7',
                actions: [
                    {
                        "name": "button name",
                        "text": "button text",
                        "type": "button",
                        "value": "whatever you want to pass into the interactive_message_callback"}
                ]
            }
        ],
        icon_url: 'http://14379-presscdn-0-86.pagely.netdna-cdn.com/wp-content/uploads/2014/05/ButtonButton.jpg'

    }
    bot.reply(message, testButtonReply);
});

// Sample uptime method
controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {
        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());
        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.');
    });

// Function to format data for the uptime method
function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

// Sample help controller method
controller.hears(['^help[ ]?(.*)'], 'direct_message,direct_mention', function (bot, message) {
    var topic = message.match[1];

    switch(topic) {
        case "weather":
            bot.reply(message, 'If you had a command to get you the weather you could explain it here');
            break;
        case "cat":
            bot.reply(message, 'Type "get me a cat" to get a gif of a kitty');
            break;
        case "room status":
            bot.reply(message, 'This would display info about the "room status" command');
            break;
        case "uptime":
            bot.reply(message, 'Displays the bot uptime and host');
            break;
        default:
            bot.reply(message, 'You might want to have a list of all the commands here');
    }

});

//REQUIRED FOR INTERACTIVE BUTTONS
// This controller method handles every interactive button click
controller.on('interactive_message_callback', function(bot, message) {
    // These 3 lines are used to parse out the id's
    var ids = message.callback_id.split(/\-/);
    var user_id = ids[0];
    var item_id = ids[1];

    var callbackId = message.callback_id;

    // Example use of Select case method for evaluating the callback ID
    // Callback ID 123 for weather bot webcam
    switch(callbackId) {
        case "123":
            bot.replyInteractive(message, "Button works!");
            break;
        // Add more cases here to handle for multiple buttons
        default:
            // For debugging
            bot.reply(message, 'The callback ID has not been defined');
    }
});

//REQUIRED FOR INTERACTIVE MESSAGES
controller.storage.teams.all(function(err,teams) {

    if (err) {
        throw new Error(err);
    }

    // connect all teams with bots up to slack!
    for (var t  in teams) {
        if (teams[t].bot) {
            controller.spawn(teams[t]).startRTM(function(err, bot) {
                if (err) {
                    console.log('Error connecting bot to Slack:',err);
                } else {
                    console.log(bot);
                    trackBot(bot);
                }
            });
        }
    }

});