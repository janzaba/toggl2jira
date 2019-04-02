'use strict';

let sinon = require('sinon');

let toggl = new (require('../lib/toggl'))('secret');

/**
 * Tests for 'Toggl' class
 */
describe('Toggl', function() {
  /**
   * Test for 'Toggl#fetchTimeEntries' method without grouping
   */
  describe('#fetchTimeEntries(false, callback)', function() {
    it('should return entries without \'redmine\' tag', function() {
      let timeEntries = [
        {id: 1, tags: ['sample-tag']},
        {id: 2, tags: ['redmine']},
        {id: 3, tags: ['sample-tag', 'redmine']},
      ];

      // Create toggl client stub
      let getTimeEntries = sinon.stub(toggl.client, 'getTimeEntries');
      getTimeEntries.yields(null, timeEntries);

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      toggl.fetchTimeEntries(null, null, false, callback);

      getTimeEntries.restore();
      sinon.assert.calledWith(callback, null, timeEntries.slice(0, 1));
    });
  });

  /**
   * Test for 'Toggl#fetchTimeEntries' method with grouping
   */
  describe('#fetchTimeEntries(true, callback)', function() {
    it('should return entries without \'redmine\' tag', function() {
      let timeEntries = [
        {id: 1, duration: 1000, tags: ['sample-tag']},
        {id: 2, duration: 2000, tags: ['redmine']},
        {id: 3, duration: 500, tags: ['sample-tag', 'redmine']},
        {id: 4, duration: 1200, tags: ['sample-tag']},
        {id: 5, duration: 3600},
        {id: 6, duration: 2500, tags: ['other-tag', 'sample-tag']},
        {id: 7, duration: 200},
        {id: 8, duration: 1900, tags: ['sample-tag', 'other-tag']},
      ];

      // Create toggl client stub
      let getTimeEntries = sinon.stub(toggl.client, 'getTimeEntries');
      getTimeEntries.yields(null, timeEntries);

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      toggl.fetchTimeEntries(null, null, true, callback);

      // Expected timeEntries
      let expectedTimeEntries = [
        {id: 1, duration: 2200, tags: ['sample-tag'], ids: [1, 4]},
        {id: 5, duration: 3800, ids: [5, 7]},
        {id: 6, duration: 4400, tags: ['other-tag', 'sample-tag'], ids: [6, 8]},
      ];

      getTimeEntries.restore();
      sinon.assert.calledWith(callback, null, expectedTimeEntries);
    });
  });

  /**
   * Test for 'Toggl#addRedmineTagToTimeEntry' method
   */
  describe('#addRedmineTagToTimeEntry(timeEntry, callback)', function() {
    it('should add \'redmine\' tag to given time entry', function() {
      let data = {
        id: 4,
      };

      // Create toggl client stub
      let addTimeEntriesTags = sinon.stub(toggl.client, 'addTimeEntriesTags');
      addTimeEntriesTags.withArgs([4], ['redmine']).yields(null);

      // Prepare callback
      let callback = sinon.spy();

      // Run method under test
      toggl.addRedmineTagToTimeEntry(data, callback);

      addTimeEntriesTags.restore();
      sinon.assert.calledWith(callback, null);
    });
  });
});
