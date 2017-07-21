
module.exports = function(skill, info, bot, message, senti, services) {
  console.log('INVOCATION OF NON-CONFIGURED SKILL: ' + skill);

    bot.reply(message, "Retrieving Jira Versions. Please wait...");
    bot.startConversation(message, function(err, convo) {
        services.jiraService.getAllVersions().then((versions)=>{
            convo.ask({
                text: "Please select one of them",
                attachments: versions.map((version)=>({
                    title: version.name,
                    callback_id: '123',
                    attachment_type: 'default',
                    actions: [
                        {
                            "name":"yes",
                            "text": "Yes",
                            "value": "yes",
                            "type": "button",
                        },
                        {
                            "name":"no",
                            "text": "No",
                            "value": "no",
                            "type": "button",
                        }
                    ]
                }))
            },[
                {
                    pattern: "yes",
                    callback: function(reply, convo) {
                        convo.say('FABULOUS!');
                        convo.next();
                        // do something awesome here.
                    }
                },
                {
                    pattern: "no",
                    callback: function(reply, convo) {
                        convo.say('Too bad');
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function(reply, convo) {
                        // do nothing
                    }
                }
            ]);
        });
    });
};
