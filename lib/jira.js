'use strict';

let request = require('request');

/**
 * Jira class
 *
 * @class Jira
 */
class Jira {
  /**
   * Constructor
   *
   * @param {String} uri
   * @param {String} username
   * @param {String} password
   */
  constructor(uri, username, password) {
	this.username = username;
    this.password = password;
    this.uri = uri;
  }

  /**
   * Create time entry
   *
   * @param {Object} timeEntry
   * @param {Callable} callback
   */
  createTimeEntry(timeEntry, callback) {
    let time = this.roundToHalfAnHour(timeEntry.timeSpentSeconds);
    let bodyData = `{
"timeSpentSeconds": ${time},
"comment": "${timeEntry.comment}",
"started": "${timeEntry.started}"
}`;
    let options = {
      method: 'POST',
      url: ''.concat(this.uri)
        .concat('/rest/api/2/issue/')
        .concat(timeEntry.issueId)
        .concat('/worklog'),
      auth: {
        'user': this.username,
        'pass': this.password,
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: bodyData,
    };
    request(options, callback);
  }

  /**
   * Converts toggl time entry to jira time entry
   *
   * @param {Object} data
   * @param {Callable} callback
   */
  taskEntryFromToggl(data, callback) {
    let description = data.description || '';
    let descriptionMatch = description.match(/#([\d\w-]*)[^:]*(\s*:\s*(.+))?/);

    if (!descriptionMatch) {
      callback('Time entry description is invalid');
      return;
    }
    description = descriptionMatch[3] ? descriptionMatch[3] : '';
    let newData = {
      'issueId': descriptionMatch[1],
      'timeSpentSeconds': data.duration,
      'comment': description,
      'started': data.start.replace('+00:00', '.000+0000'),
    };
    callback(null, newData);
  }

  /**
   * @param {integer} seconds
   * @return {number}
   */
  roundToHalfAnHour(seconds) {
    let num = 1800;
    let resto = seconds % num;
    if (resto <= (num / 3)) {
      return seconds - resto;
    } else {
      return seconds + num - resto;
    }
  }

}

module.exports = Jira;
