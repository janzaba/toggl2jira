# Toggl to Jira Time Entry Exporter

This script fetches time entries from the Toggl API, parses the description of each entry for Jira issue keys, and creates a corresponding worklog entry in Jira.

## Prerequisites

Before you begin, ensure you have met the following requirements:

* You have installed Python 3.7 or later.
* You have a Toggl account with API access.
* You have a Jira account with API access.

## Installing Toggl to Jira Time Entry Exporter

To install Toggl to Jira Time Entry Exporter, follow these steps:

1. Clone the repository
2. Install the required Python packages:

```bash
pip install -r requirements.txt
```

## Using Toggl to Jira Time Entry Exporter

To use Toggl to Jira Time Entry Exporter, follow these steps:

1. Copy `config.py.dist` into `config.py`
2. Open `config.py` and fill in your Toggl and Jira API credentials.
2. Run the script:

```bash
python3 toggl2jira.py
```

## Time Entry Format

The script supports the following time entry formats:

1. `#TASK_NUMBER TASK_TITLE : ENTRY_MESSAGE`
    * `TASK_NUMBER` is the unique number of the Jira task
    * `TASK_TITLE` is the title of the Jira task
    * `ENTRY_MESSAGE` is the message that will be attached to the time entry in Jira

2. `@TASK_NUMBER TASK_TITLE : ENTRY_MESSAGE`
    * `TASK_NUMBER` is the unique number of the Jira task
    * `TASK_TITLE` is the title of the Jira task
    * `ENTRY_MESSAGE` is the message that will be attached to the time entry in Jira

The script will parse the time entries based on these patterns and push them to the corresponding Jira tasks.

## Unit tests
To run unit tests use following:

```
pytest test_toggl2jira.py
```


## Authors

- ChatGPT-4
- Jan Żaba

## Contact

If you want to contact me you can reach me at `janekzaba@gmail.com`.

## License

This project uses the following license: [MIT](https://opensource.org/licenses/MIT).
