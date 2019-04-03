'use strict';

let RedmineClient = require('node-redmine');
let async = require('async');

/**
 * Field 'Activity' default value
 * @const {Number}
 */
const FIELD_ACTIVITY_DEFAULT_VALUE = 13;

/**
 * Field 'Type' ID number
 * @const {Number}
 */
const FIELD_TYPE_ID = 14;

/**
 * Field 'Type' default value
 * @var {String}
 */
const FIELD_TYPE_DEFAULT_VALUE = 'Billable';

/**
 * Redmine class
 *
 * @class Redmine
 */
class Redmine {
  /**
   * Constructor
   *
   * @param {String} uri
   * @param {String} token
   */
  constructor(uri, token) {
    this.client = new RedmineClient(uri, {
      apiKey: token,
    });
  }

  /**
   * Create time entry
   *
   * @param {Object} timeEntry
   * @param {Callable} callback
   */
  createTimeEntry(timeEntry, callback) {
    this.client.create_time_entry({'time_entry': timeEntry}, callback);
  }

  /**
   * Converts toggl time entry to redmine time entry
   *
   * @param {Object} data
   * @param {Callable} callback
   */
  taskEntryFromToggl(data, callback) {
    let description = data.description || '';
    let descriptionMatch = description.match(/#(\d+)[^:]*(\s*:\s*(.+))?/);

    if (!descriptionMatch) {
      callback('Time entry description is invalid');
      return;
    }

    let newData = {
      'issue_id': descriptionMatch[1],
      'spent_on': data.start.match(/^[^T]+/)[0],
      'hours': (data.duration * 1.2 / 3600).toFixed(1),
      'comments': descriptionMatch[3] ? descriptionMatch[3] : '',
      'activity_id': FIELD_ACTIVITY_DEFAULT_VALUE,
      'custom_field_values': {
        [FIELD_TYPE_ID]: FIELD_TYPE_DEFAULT_VALUE,
      },
    };

    let self = this;
    /**
     * Helper method for parsing a tag
     *
     * @param {String} tag
     * @param {Callable} callback
     */
    function parseTag(tag, callback) {
      let match;

      // Check 'Type'
      if (match = tag.match(/^Type:\s(.+)/)) {
        callback(null, {'type': match[1]});
        return;
      }

      // Check 'Activity'
      self.getTimeEntryActivity(tag, function(error, activity) {
        if (error || activity === null) {
          callback(error, {});
          return;
        }

        callback(null, {'activity': activity});
      });
    }

    // Extract 'Activity' and 'Type'
    if (data.tags) {
      async.map(data.tags, parseTag, function(error, results) {
        if (error) {
          return callback(error, null);
        }

        let map = {};

        for (let i = 0; i < results.length; i++) {
          Object.assign(map, results[i]);
        }

        if (map['activity']) {
          newData['activity_id'] = map['activity'];
        }
        if (map['type']) {
          newData['custom_field_values'][FIELD_TYPE_ID] = map['type'];
        }

        callback(error, newData);
      });

      return;
    }

    callback(null, newData);
  }

  /**
   * Returns time entry activities
   *
   * @param {Callable} callback
   */
  getTimeEntryActivities(callback) {
    if (typeof this._activities !== 'undefined') {
      callback(null, this._activities);
      return;
    }

    let self = this;
    this.client.time_entry_activities(function(error, data) {
      if (error) {
        self._activities = null;
        callback(error, null);
        return;
      }

      // Convert activities into { name => id } map
      self._activities = {};
      data.time_entry_activities.forEach(function(item) {
        self._activities[item.name] = item.id;
      });

      callback(error, self._activities);
    });
  }

  /**
   * Returns time entry activities
   *
   * @param {String} name
   * @param {Callable} callback
   */
  getTimeEntryActivity(name, callback) {
    this.getTimeEntryActivities(function(error, activities) {
      if (error) {
        return callback(error, null);
      }

      for (let key in activities) {
        if (name == key) {
          return callback(null, activities[key]);
        }
      }

      return callback(null, null);
    });
  }

}

module.exports = Redmine;
