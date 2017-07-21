
var JiraService = require("./JiraService");
var SlidesService = require("./SlidesService");

class ServiceProvider {

    constructor(db) {
        this.jiraService = new JiraService(db);
        this.slidesSlides = new SlidesService(db);
    }

}

module.exports = ServiceProvider;
