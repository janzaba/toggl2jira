import pytest
import requests_mock
import toggl2jira
import pandas as pd

from datetime import datetime, timedelta
from unittest.mock import patch
from urllib.parse import urlparse, parse_qs
from dateutil.parser import parse


def test_add_worklog_to_jira():
    jira_url = 'https://divante.atlassian.net/rest/api/2/'
    task_number = 'TMAG-108'
    entry_message = 'Test message'
    duration = 1000  # duration in seconds
    started_time = '2023-05-23T06:31:15+0000'

    with requests_mock.Mocker() as m:
        # Mock the Jira API call
        m.post(f'{jira_url}issue/{task_number}/worklog', json={'id': '123'}, status_code=201)

        # Call the function
        toggl2jira.add_worklog_to_jira(jira_url, task_number, entry_message, duration, started_time)

        # Assert the request was correctly made
        assert m.called
        assert m.call_count == 1
        req = m.request_history[0]
        assert req.method == 'POST'
        assert req.url == f'{jira_url}issue/{task_number}/worklog'

def test_get_toggl_time_entries():
    toggl_headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic abc123'
    }

    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    params = {
        'start_date': start_date.isoformat() + 'Z',
        'end_date': end_date.isoformat() + 'Z'
    }

    with requests_mock.Mocker() as m, patch('datetime.datetime') as mock_datetime:
        # set the datetime that you want to mock
        mock_datetime.now.return_value = end_date

        # Mock the Toggl API call
        m.get('https://api.track.toggl.com/api/v8/time_entries', json=[{
            'id': 1,
            'description': '#TMAG-108 Test description',
            'duration': 1000,
            'start': '2023-05-23T06:31:15.000+0000'
        }], headers=toggl_headers)

        # Call the function
        entries = toggl2jira.get_toggl_time_entries()

        # Verify that entries is a dataframe and it's not empty
        assert isinstance(entries, pd.DataFrame)
        assert not entries.empty

        # Assert the request was correctly made
        assert m.called
        assert m.call_count == 1
        req = m.request_history[0]
        assert req.method == 'GET'

        req_url = urlparse(req.url)
        expected_url = urlparse(f'https://api.track.toggl.com/api/v8/time_entries?start_date={params["start_date"]}&end_date={params["end_date"]}')

        assert req_url.scheme == expected_url.scheme
        assert req_url.netloc == expected_url.netloc
        assert req_url.path == expected_url.path

        req_params = parse_qs(req_url.query)
        expected_params = parse_qs(expected_url.query)

        assert req_params.keys() == expected_params.keys()

        for param, value in expected_params.items():
            if 'date' in param:  # If it's a datetime param
                req_time = parse(value[0])
                expected_time = parse(req_params[param][0])
                # Check if the time difference is less than 1 second
                assert abs((req_time - expected_time).total_seconds()) < 1
            else:
                assert req_params[param] == value

