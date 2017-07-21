"use strict";

var BotKit = require('botkit');

// Check for ENV variables - Required to be a slack app to use interactive buttons
if (!process.env.SLACK_ID || !process.env.SLACK_SECRET || !process.env.PORT) {
    console.log('Error: Specify clientId clientSecret and port in environment');
    process.exit(1);
}

class Ears {

    constructor() {

        this._bots = {};

        this.scopes = [
            'direct_mention',
            'direct_message',
            'mention'
        ];

        this.controller = BotKit.slackbot({
            debug: false,
            interactive_replies: true, // tells botkit to send button clicks into conversations
            json_file_store: './config/',
            redirectUrl: process.env.SLACK_REDIRECT,
        }).configureSlackApp(
            {
                clientId: process.env.SLACK_ID,
                clientSecret: process.env.SLACK_SECRET,
                // Set scopes as needed. https://api.slack.com/docs/oauth-scopes
                scopes: ['bot', 'incoming-webhook', 'team:read', 'users:read', 'users.profile:read', 'channels:read', 'im:read', 'im:write', 'groups:read', 'emoji:read', 'chat:write:bot'],
            }
        );
        this._setupWebServer();
        this._listenRtm();
        this._listenBotCreation();
    }

    _setupWebServer() {
        // Setup for the Webserver - REQUIRED FOR INTERACTIVE BUTTONS
        this.controller.setupWebserver(process.env.PORT, (err,webserver)=> {

            this.controller.createWebhookEndpoints(this.controller.webserver);

            this.controller.createOauthEndpoints(this.controller.webserver, (err,req,res) =>{
                if (err) {
                    res.status(500).send('ERROR: ' + err);
                } else {
                    res.send('Success!');
                }
            });
        });

    }

    _listenRtm() {
        // Handle events related to the websocket connection to Slack
        this.controller.on('rtm_open',function(bot) {
            console.log('** The RTM api just connected!');
        });

        this.controller.on('rtm_close',function(bot) {
            console.log('** The RTM api just closed');
            // you may want to attempt to re-open
        });
    }

    _listenBotCreation() {
        // Method for when the bot is added to a team
        this.controller.on('create_bot', (bot,config) => {
            if (this._bots[bot.config.token]) {
                // already online! do nothing.
            } else {
                bot.startRTM((err) => {
                    if (!err) {
                        this._trackBot(bot);
                    }
                    bot.startPrivateConversation({user: config.createdBy},function(err,convo) {
                        if (err) {
                            console.log(err);
                        } else {
                            convo.say('I am a DFM bot that has just joined your team');
                            convo.say('You must now /invite me to a channel so that I can be of use!');
                        }
                    });
                });
            }
        });

    }

    _trackBot(bot) {
        this._bots[bot.config.token] = bot;
    }

    listen(db) {
        //REQUIRED FOR INTERACTIVE MESSAGES
        this.controller.storage.teams.all((err, teams) => {

            if (err) {
                throw new Error(err);
            }

            // connect all teams with bots up to slack!
            for (var t  in teams) {
                if (teams[t].bot) {
                    this.controller.spawn(teams[t]).startRTM(function (err, bot) {
                        if (err) {
                            console.log('Error connecting bot to Slack:', err);
                        } else {
                            console.log(bot);
                            this._trackBot(bot);
                        }
                    });
                }
            }
        });
        return this;

    }

    hear(pattern, callback) {
        this.controller.hears(pattern, this.scopes, callback);
        return this;
    };

    on(event, cb) {
        this.controller.on(event, cb);
        return this;
    }

}

module.exports = Ears;