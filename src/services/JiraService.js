const JiraApi = require("jira").JiraApi;
const util = require("util");

const DEFAULT_PROJECT = "WMO";
const DEFAULT_LABEL = "LNO";

const JIRA_ISSUES_FILTER = "project = %s AND issuetype in standardIssueTypes() AND status in (Resolved, Closed, \"In Review\") AND labels = %s AND Sprint = %s"

class JiraService {

    constructor() {
        this.jiraApi = new JiraApi(
            "https",
            "lvserv01.logivations.com",
            443,
            process.env.JIRA_USER_NAME,
            process.env.JIRA_PASSWORD,
            "latest"
        );
    }

    getActiveSprintVersion() {
        return new Promise((resolve) => {
            resolve("7.11")
        });
    }

    findDFMIssues() {
        var self = this;
        return new Promise((resolve, reject) => {
            self.getActiveSprintVersion().then(function (sprint) {
                self.jiraApi.searchJira(util.format(JIRA_ISSUES_FILTER, DEFAULT_PROJECT, DEFAULT_LABEL, sprint),
                    ["summary", "status", "assignee", "description", "changelog"], function (error, response) {
                        if (error) {
                            reject(error)
                        } else {
                            var issues = response.issues.map((issue)=>{
                                return {
                                    id: issue.id,
                                    link: issue.self + "?expand=changelog)",
                                    summary: issue.fields.summary,
                                    // description: issues.fields.description
                                };
                            });
                            resolve(issues)
                        }
                    })
            })
        });
    }

    getAllVersions() {
        return new Promise((resolve, reject) => {
            this.jiraApi.getVersions(DEFAULT_PROJECT, function (error, versions) {
                if (error) {
                    reject(error)
                } else {
                    resolve(versions)
                }
            })
        });
    }
}

module.exports = JiraService;