
module.exports = function(skill, info, bot, message, senti, services) {
  console.log('INVOCATION OF NON-CONFIGURED SKILL: ' + skill);

    bot.reply(message, "Retrieving Jira Versions. Please wait...");
    bot.startConversation(message, function(err, convo) {
        var fixVersion, jiraIssues;
        services.jiraService.getAllVersions().then((versions)=>{

            convo.ask({
                text: "Here is the list of fix versions. Please type one of them!",
                attachments: versions.map((version)=>({
                    "title": version.name,
                    "text": version.releasedDate,
                    "mrkdwn_in": [
                        "text",
                        "pretext"
                    ]
                }))
            }, [
                {
                    pattern: ".*",
                    callback: function(response, convo) {
                        fixVersion = versions.find((version)=>{version.name==response.text});
                        convo.say(`Right, I\'ll fetch issues by Fix Version ${fixVersion}. Please wait...`);
                        services.jiraService.findDFMIssues(fixVersion).then((issues)=>{

                            convo.ask({
                                text: "Here is the list of issues. Please type 'agree' to continue",
                                attachments: issues.map((issue) => ({
                                    "pretext": issue.summary,
                                    "title": issue.title,
                                    "title_link": issue.title_link
                                }))
                            }, [{
                                pattern: '^agree$',
                                callback: function (response, convo) {
                                    convo.say("Presentation is preparing. Please wait...");
                                    services.slides.writeSlidesTemplate(fixVersion, issues).then((link) => {
                                        convo.say(`Here is link of presentation ${link}.`);
                                        convo.ask("Do you want to share it in general chanel. Please type 'yes' to continue", [
                                            {
                                                pattern: '^yes$',
                                                callback: function (response, convo) {

                                                    convo.next();
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
