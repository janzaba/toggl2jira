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
   * @param {String} apiKey
   * @param {String} idKey
   */
  constructor(uri, apiKey, idKey) {
    this.apiKey = apiKey;
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
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic '.concat(this.encode(this.apiKey)),
      },
      body: bodyData,
    };
    request(options, function(error) {
      if (error) {
        console.error('error:', error);
        return callback(error);
      }
    });
    return callback(null);
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

  /**
   * @param {String} token
   * @return {String}
   */
  encode(token) {
    let buff = Buffer.from(token);
    return buff.toString('base64');
  }
}

module.exports = Jira;
