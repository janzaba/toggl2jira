'use strict';

let sinon = require('sinon');

let redmine = new (require('../lib/redmine'))('http://example.com', 'secret');

let timeEntryActivities;

/**
 * Tests for 'Redmine' class
 */
describe('Redmine', function() {
  before(function() {
    // Create redmine client stub
    timeEntryActivities = sinon.stub(redmine.client, 'time_entry_activities');
    timeEntryActivities.yields(null, {
      'time_entry_activities': [
        {'id': 1, 'name': 'Development'},
        {'id': 2, 'name': 'Research'},
        {'id': 3, 'name': 'Planning'},
      ],
    });
  });

  after(function() {
    // Restore redmine client stub
    timeEntryActivities.restore();
  });

  /**
   * Test for 'Redmine#createTimeEntry' method
   */
  describe('#createTimeEntry(timeEntry, callback)', function() {
    it('should create new time entry', function() {
      let data = {

      };

      // Create redmine client stub
      let createTimeEntry = sinon.stub(redmine.client, 'create_time_entry');
      createTimeEntry.yields(null, data);

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.createTimeEntry(data, callback);

      createTimeEntry.restore();
      sinon.assert.calledWith(callback, null, data);
    });
  });
  /**
   * Test for 'Redmine#taskEntryFromToggl' method
   */
  describe('#taskEntryFromToggl(data)', function() {
    it(`should convert toggl time entry data into \
        redmine task entry data`, function() {
      let data = {
        'id': 582566690,
        'wid': 1552930,
        'pid': 19463126,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Feature #56060 Kompletne dane testowe',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 2344416,
      };

      let expected = {
        'issue_id': '56060',
        'spent_on': '2017-04-21',
        'hours': '0.9',
        'activity_id': 13,
        'custom_field_values': {
          14: 'Billable',
        },
        'comments': '',
      };

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.taskEntryFromToggl(data, callback);

      sinon.assert.calledWith(callback, null, expected);
    });
    it(`should convert toggl time entry data into \
        redmine task entry data with comments`, function() {
      let data = {
        'id': 582566690,
        'wid': 1552930,
        'pid': 19463126,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Feature #56060 Kompletne dane testowe : Test',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 2344416,
      };

      let expected = {
        'issue_id': '56060',
        'spent_on': '2017-04-21',
        'hours': '0.9',
        'activity_id': 13,
        'custom_field_values': {
          14: 'Billable',
        },
        'comments': 'Test',
      };

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.taskEntryFromToggl(data, callback);

      sinon.assert.calledWith(callback, null, expected);
    });
    it(`should convert toggl time entry data into \
        redmine task entry data with custom activity`, function() {
      let data = {
        'id': 123456,
        'wid': 123456,
        'pid': 123456,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Feature #56060 Kompletne dane testowe',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 123456,
        'tags': ['Research'],
      };

      let expected = {
        'issue_id': '56060',
        'spent_on': '2017-04-21',
        'hours': '0.9',
        'activity_id': 2,
        'custom_field_values': {
          14: 'Billable',
        },
        'comments': '',
      };

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.taskEntryFromToggl(data, callback);

      sinon.assert.calledWith(callback, null, expected);
    });
    it(`should convert toggl time entry data into \
        redmine task entry data with custom type`, function() {
      let data = {
        'id': 123456,
        'wid': 123456,
        'pid': 123456,
        'billable': false,
        'start': '2016-12-19T00:20:40+00:00',
        'stop': '2016-12-19T02:26:30+00:00',
        'duration': 7510,
        'description': 'Feature #40540 Konfiguracja środowiska - Docker',
        'duronly': false,
        'at': '2016-12-19T12:00:00+00:00',
        'uid': 123456,
        'tags': ['Type: NB - Our fault'],
      };

      let expected = {
        'issue_id': '40540',
        'spent_on': '2016-12-19',
        'hours': '2.5',
        'activity_id': 13,
        'custom_field_values': {
          14: 'NB - Our fault',
        },
        'comments': '',
      };

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.taskEntryFromToggl(data, callback);

      sinon.assert.calledWith(callback, null, expected);
    });
    it(`should convert toggl time entry data into \
        redmine task entry data with both custom type \
        and custom availability`, function() {
      let data = {
        'id': 123456,
        'wid': 123456,
        'pid': 123456,
        'billable': false,
        'start': '2017-04-21T12:19:22+00:00',
        'stop': '2017-04-21T13:05:14+00:00',
        'duration': 2752,
        'description': 'Feature #56060 Kompletne dane testowe',
        'duronly': false,
        'at': '2017-04-21T13:05:15+00:00',
        'uid': 123456,
        'tags': ['Planning', 'Type: NB - Other'],
      };

      let expected = {
        'issue_id': '56060',
        'spent_on': '2017-04-21',
        'hours': '0.9',
        'activity_id': 3,
        'custom_field_values': {
          14: 'NB - Other',
        },
        'comments': '',
      };

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      redmine.taskEntryFromToggl(data, callback);

      sinon.assert.calledWith(callback, null, expected);
    });
  });
});
