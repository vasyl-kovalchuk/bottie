
"use strict";


var fs = require('fs');
var Train = require('../nlp/train');
var Brain = require('../nlp/brain');
var Ears = require('../nlp/ears');
var builtinPhrases = require('../../builtins');

var Bottie = {
    Brain: new Brain(),
    Ears: new Ears()
};

var customPhrasesText;
var customPhrases;
try {
    customPhrasesText = fs.readFileSync(__dirname + '/../../custom-phrases.json').toString();
} catch (err) {
    throw new Error('Uh oh, Bottie could not find the ' +
        'custom-phrases.json file, did you move it?');
}
try {
    customPhrases = JSON.parse(customPhrasesText);
} catch (err) {
    throw new Error('Uh oh, custom-phrases.json was ' +
        'not valid JSON! Fix it, please? :)');
}

console.log('DFM Assitant is learning...');
Bottie.Teach = Bottie.Brain.teach.bind(Bottie.Brain);
eachKey(customPhrases, Bottie.Teach);
eachKey(builtinPhrases, Bottie.Teach);
Bottie.Brain.think();
console.log('DFM Assitant finished learning, time to listen...');
Bottie.Ears
    .listen()
    .hear('!TRAIN', function (speech, message) {
        console.log('Delegating to on-the-fly training module...');
        Train(Bottie.Brain, speech, message);
    })
    .hear('.*', function (speech, message) {
        var interpretation = Bottie.Brain.interpret(message.text);
        console.log('DFM Assitant heard: ' + message.text);
        console.log('DFM Assitant interpretation: ', interpretation);
        if (interpretation.guess) {
            console.log('Invoking skill: ' + interpretation.guess);
            Bottie.Brain.invoke(interpretation.guess, interpretation, speech, message);
        } else {
            speech.reply(message, 'Hmm... I don\'t have a response what you said... I\'ll save it and try to learn about it later.');
            // speech.reply(message, '```\n' + JSON.stringify(interpretation) + '\n```');

            // append.write [message.text] ---> to a file
            fs.appendFile('phrase-errors.txt', '\nChannel: ' + message.channel + ' User:' + message.user + ' - ' + message.text, function (err) {
                console.log('\n\tBrain Err: Appending phrase for review\n\t\t' + message.text + '\n');
            });
        }
    }).hear(['test button'], function (bot, message) {
        var testButtonReply = {
            username: 'Button Bot',
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
                            "value": "whatever you want to pass into the interactive_message_callback"
                        }
                    ]
                }
            ],
            icon_url: 'http://14379-presscdn-0-86.pagely.netdna-cdn.com/wp-content/uploads/2014/05/ButtonButton.jpg'

        };
        bot.reply(message, testButtonReply);
}).on("interactive_message_callback", function (bot, message) {
    // These 3 lines are used to parse out the id's
    var ids = message.callback_id.split(/\-/);
    var user_id = ids[0];
    var item_id = ids[1];

    var callbackId = message.callback_id;

    // Example use of Select case method for evaluating the callback ID
    // Callback ID 123 for weather bot webcam
    switch (callbackId) {
        case "123":
            bot.replyInteractive(message, "Button works!");
            break;
        // Add more cases here to handle for multiple buttons
        default:
            // For debugging
            bot.reply(message, 'The callback ID has not been defined');
    }
});

function eachKey(object, callback) {
    Object.keys(object).forEach(function(key) {
        callback(key, object[key]);
    });
}