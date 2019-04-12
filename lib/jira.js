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
  constructor(uri, username, password, idKey) {
	  this.username = username;
    this.password = password;
    this.uri = uri;
    this.idKey = idKey;
  }

  /**
   * Create time entry
   *
   * @param {Object} timeEntry
   * @param {Callable} callback
   */
  createTimeEntry(timeEntry, callback) {
    let bodyData = `{
"timeSpentSeconds": ${timeEntry.timeSpentSeconds},
"comment": "${timeEntry.comment}",
"started": "${timeEntry.started}"
}`;
    let options = {
      method: 'POST',
      url: ''.concat(this.uri).concat('/rest/api/2/issue/').concat(timeEntry.issueId).concat('/worklog'),
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
    let regex = new RegExp(this.idKey + '([\\d\\w-]*)[^:]*(\\s*:\\s*(.+))?');
    let descriptionMatch = description.match(regex);

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
}

module.exports = Jira;
