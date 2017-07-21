const Store = require("jfs");

class DataManager {

    presentation;
    scheduler;

    constructor() {
        this.presentation = new Store("./../../config/presentations.json");
        this.scheduler = new Store("./../../config/scheduler.json");
    }

    addNewPresentation() {

    }

    scheduleEvent() {

    }


}

module.exports.default = DataManager;