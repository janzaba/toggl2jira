import re
import requests
import pandas as pd
import base64
import config
from getpass import getpass
from datetime import datetime, timedelta

toggl_headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + base64.b64encode(f'{config.TOGGL_API_TOKEN}:api_token'.encode()).decode()
}

jira_headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + base64.b64encode(f'{config.JIRA_USERNAME}:{config.JIRA_API_TOKEN}'.encode()).decode()
}

def get_toggl_time_entries():
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    params = {
        'start_date': start_date.isoformat() + 'Z',
        'end_date': end_date.isoformat() + 'Z'
    }
    response = requests.get(
        config.TOGGL_BASE_URL + 'time_entries',
        headers=toggl_headers,
        params=params
    )
    if response.status_code != 200:
        raise Exception(f'Failed to get time entries from Toggl. Status code: {response.status_code}')
    data = pd.DataFrame(response.json())
    if 'tags' not in data.columns:
        data['tags'] = pd.Series([[] for _ in range(len(data))])
    data = data[~data['tags'].apply(lambda tags: 'processed' in tags if isinstance(tags, list) else False)]
    return data

def add_worklog_to_jira(jira_url, task_number, entry_message, duration, started_time):
    # Convert the duration to an integer if it's not already one
    if not isinstance(duration, int):
        try:
            duration = int(duration)
        except ValueError:
            raise ValueError(f'Duration must be an integer. Got {duration}.')

    # Check if duration is a positive integer
    if duration <= 0:
        raise ValueError(f'Duration must be a positive integer. Got {duration}.')

    hours, minutes = divmod(duration // 60, 60)
    time_spent = f'{hours}h {minutes}m'

    # Convert the start time to the format expected by Jira
    started = datetime.strptime(started_time, "%Y-%m-%dT%H:%M:%S%z").strftime("%Y-%m-%dT%H:%M:%S.000%z")

    payload = {
        'comment': entry_message.strip(),
        'timeSpent': time_spent,
        'started': started
    }

    response = requests.post(
        jira_url + f'issue/{task_number}/worklog',
        headers=jira_headers,
        json=payload
    )

    if response.status_code != 201:
        print(f'Task number: {task_number}')
        print(f'Request payload: {payload}')
        print(f'Response body: {response.text}')
        raise Exception(f'Failed to create worklog for task {task_number}. Status code: {response.status_code}')

def add_processed_tag_to_toggl(time_entry_id, tags):
    # If tags is not a list (i.e., it's NaN), create an empty list
    if not isinstance(tags, list):
        tags = []
    tags.append('processed')
    payload = {
        'time_entry': {
            'tags': tags,
            'tag_action': 'add'
        }
    }
    response = requests.put(
        config.TOGGL_BASE_URL + f'time_entries/{time_entry_id}',
        headers=toggl_headers,
        json=payload
    )
    if response.status_code != 200:
        raise Exception(f'Failed to add "processed" tag to time entry {time_entry_id}. Status code: {response.status_code}')


def process_time_entries():
    data = get_toggl_time_entries()
    for index, row in data.iterrows():
        result = re.match(r'([#@])([\w-]+).*:(.*)', row['description'])
        if result:
            prefix, task_number, entry_message = result.groups()

            jira_url = config.JIRA_BASE_URL if prefix == '#' else config.JIRA_ALT_BASE_URL

            add_worklog_to_jira(jira_url, task_number, entry_message, row['duration'], row['start'])
            add_processed_tag_to_toggl(row["id"], row.get('tags', []))

if __name__ == "__main__":
    process_time_entries()