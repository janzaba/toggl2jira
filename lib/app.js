'use strict';

let Toggl = require('./toggl');
let Jira = require('./jira');

/**
 * App class
 *
 * @class App
 */
class App {
  /**
   * Constructor
   *
   * @param {Object} options
   *
   * options:
   *   toggl:
   *     apiKey: toggl api key
   *   jira:
   *     url: url to jira
   *     username: jira username
   *     password: jira password
   *   date: date
   *   group: group entries flag
   */
  constructor(options) {
    this.options = options;

    this.toggl = new Toggl(
      this.options.toggl.apiKey
    );
    this.jira = new Jira(
      this.options.jira.url,
      this.options.jira.username,
      this.options.jira.password
    );
  }

  /**
   * Run time entries migration from toggl to jira
   */
  run() {
    let self = this;

    // Prepare start and end date
    let startDate = new Date(Date.parse(this.options.date));
    let endDate = new Date(Date.parse(this.options.date));
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    // Fetch toggl time entries
    this.toggl.fetchTimeEntries(
      startDate,
      endDate,
      this.options.group,
      function(error, entries) {
        if (error) {
          process.stderr.write(error);
          return;
        }
        // Convert toggl time entries to jira time spents
        entries.forEach(function(togglTimeEntry) {
          self.jira.taskEntryFromToggl(togglTimeEntry,
            function(error, jiraTimeEntry) {
            if (error) {
              process.stderr.write(error);
              return;
            }
            // Push time spent to jira
            self.jira.createTimeEntry(jiraTimeEntry, function(error) {
              if (error) {
                process.stderr.write(error);
                return;
              }

              // Add 'processed' tag to toggl time entry
              self.toggl.addProcessedTagToTimeEntry(togglTimeEntry,
                function(error) {
                if (error) {
                  process.stderr.write(error);
                  return;
                }
              });
            });
          });
        });
      }
    );
  };
}

module.exports = App;
