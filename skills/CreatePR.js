
module.exports = function(skill, info, bot, message, senti, services) {
  console.log('INVOCATION OF NON-CONFIGURED SKILL: ' + skill);

    bot.reply(message, "Retrieving Jira Versions. Please wait...");
    bot.startConversation(message, function(err, convo) {
        var fixVersion;
        services.jiraService.getAllVersions().then((versions)=>{
            convo.say({
                text: "Here is the list of fix versions",
                attachments: versions.map((version)=>({
                    "title": version.name,
                    "text": version.releaseDate,
                    "mrkdwn_in": [
                        "text",
                        "pretext"
                    ]
                }))
            });
            convo.ask("Please type one...", [
                {
                    pattern: ".*",
                    callback: function (response, convo) {
                        fixVersion = versions.find(version => version.name == response.text);
                        convo.say(`Right, I\'ll fetch issues by Fix Version ${fixVersion.name}. Please wait...`);
                        services.jiraService.findDFMIssues(fixVersion.name).then((issues) => {
                            convo.say({
                                text: "Here is the list of issues.",
                                attachments: issues.map((issue) => ({
                                    "pretext": issue.summary,
                                    "title": issue.key,
                                    "title_link": issue.title_link
                                }))
                            });
                            convo.ask("Please type 'agree' to create presentation", [{
                                pattern: '^agree$',
                                callback: function (response, convo) {
                                    convo.say("Presentation is preparing. Please wait...");
                                    services.slides.writeSlidesTemplate(fixVersion, issues).then((link) => {
                                        convo.say(`Here is link of presentation ${link}.`);
                                        convo.ask("Do you want to share it in general chanel. Please type 'yes' to continue", [
                                            {
                                                pattern: '^yes$',
                                                callback: function (response, convo) {

                                                    bot.say({
                                                        text: `Hi All! Here is the link for the next DFM on ${fixVersion.releasedDate} \n Please follow the link below ${link} \nSpeakers, feel free to fill the slides`,
                                                        channel: ''
                                                    });
                                                    convo.next()
                                                }
                                            },
                                            {
                                                pattern: '.*',
                                                callback: function (response, convo) {
                                                    convo.say('See you next time!');
                                                    convo.next();
                                                }
                                            }
                                        ]);
                                        convo.next();
                                    });
                                    convo.next();
                                }
                            }, {
                                pattern: '^cancel$',
                                callback: function (response, convo) {
                                    convo.say('See you next time!');
                                    convo.next();
                                }
                            }]);
                            convo.next();
                        });
                    }
                }
            ]);
            convo.next();
        });
    });
};
