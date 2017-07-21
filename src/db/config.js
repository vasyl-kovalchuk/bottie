const Store = require("jfs");

class DataManager {

    constructor() {
        this.presentation = new Store("./../../config/presentations.json");
        this.scheduler = new Store("./../../config/scheduler.json");
    }

    addNewPresentation() {
        this.presentation.allSync();
    }

    scheduleEvent() {
        this.scheduler.allSync();
    }


}

module.exports = DataManager;