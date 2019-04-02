'use strict';

let TogglClient = require('toggl-api');

/**
 * Toggl class
 *
 * @class Toggl
 */
class Toggl {
  /**
   * Constructor
   *
   * @param {String} token - API token key to authenticate with
   */
  constructor(token) {
    this.client = new TogglClient({
      'apiToken': token,
    });
  }

  /**
   * Fetches time entries without tag 'redmine'
   *
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Boolean} group
   * @param {Callable} callback
   */
  fetchTimeEntries(startDate, endDate, group, callback) {
    let self = this;
    this.client.getTimeEntries(startDate, endDate,
      function(error, timeEntries) {
      if (error) {
        return callback(error);
      }

      // Filter out entries with 'redmine' tag
      timeEntries = timeEntries.filter(function(timeEntry) {
        return !timeEntry.hasOwnProperty('tags') ||
               timeEntry['tags'].indexOf('redmine') === -1;
      });

      if (group) {
        // Goupe time entries
        timeEntries = self.groupTimeEntires(timeEntries, callback);
      }

      // Return time entries
      callback(error, timeEntries);
    });
  };

  /**
   * Groups time entires
   *
   * Groups entries by:
   * - description
   * - tags
   *
   * @param {Array} timeEntries
   * @return {Array}
   */
  groupTimeEntires(timeEntries) {
    let grouped = {};

    timeEntries.forEach(function(timeEntry) {
      // Calculate timeEntry group identifier
      let groupId = timeEntry.description +
        ((timeEntry['tags'] || []).sort().join(' - ') || '');

      if (!grouped.hasOwnProperty(groupId)) {
        // Initialize group if needed
        grouped[groupId] = timeEntry;
        timeEntry.ids = [timeEntry.id];
      } else {
        // Merge time entries
        grouped[groupId].ids.push(timeEntry.id);
        grouped[groupId].duration += timeEntry.duration;
      }
    });

    return Object.keys(grouped).map(function(key) {
      return grouped[key];
    });
  }

  /**
   * Adds 'redmine' tag to given time entry
   *
   * @param {Object} timeEntry
   * @param {Callable} callback
   */
  addRedmineTagToTimeEntry(timeEntry, callback) {
    // Add 'redmine' tag to all grouped time entries
    // if grouped or to the single time entry otherwise
    this.client.addTimeEntriesTags(
      timeEntry.ids || [timeEntry.id],
      ['redmine'],
      callback
    );
  };
}

module.exports = Toggl;
