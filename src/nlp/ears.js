"use strict";

var BotKit = require('botkit');

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
            redirectUri: process.env.SLACK_REDIRECT,
        });
        this.controller.configureSlackApp(
            {
                clientId: process.env.SLACK_ID,
                clientSecret: process.env.SLACK_SECRET,
                // Set scopes as needed. https://api.slack.com/docs/oauth-scopes
                scopes: ['bot', 'incoming-webhook', 'team:read', 'users:read', 'users.profile:read', 'channels:read', 'im:read', 'im:write', 'groups:read', 'emoji:read', 'chat:write:bot'],
            }
        );
        this._listenRtm();
        this._listenBotCreation();
    }

    setupWebServer(callback) {
        // Setup for the Webserver - REQUIRED FOR INTERACTIVE BUTTONS
        this.controller.setupWebserver(process.env.PORT, (err,webserver)=> {

            callback(webserver);

            this.controller.createHomepageEndpoint( this.controller.webserver);

            this.controller.createWebhookEndpoints(this.controller.webserver);

            this.controller.createOauthEndpoints(this.controller.webserver, (err,req,res) =>{
                if (err) {
                    res.status(500).send('ERROR: ' + err);
                } else {
                    res.send('Success!');
                }
            });
        });
        return this;

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

    listen() {
        //REQUIRED FOR INTERACTIVE MESSAGES
        this.bot = this.controller.spawn({
            token: process.env.SLACK_TOKEN
        }).startRTM((err) => {
            if (!err) {
                this._trackBot(this.bot);
            }
            this.bot.startPrivateConversation({user: this.bot.config.createdBy},function(err,convo) {
                if (err) {
                    console.log(err);
                } else {
                    convo.say('I am a DFM bot that has just joined your team');
                    convo.say('You must now /invite me to a channel so that I can be of use!');
                }
            });
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