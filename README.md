# Toggl2Jira [![Build Status](https://travis-ci.org/janzaba/toggl2jira.svg?branch=master)](https://travis-ci.org/janzaba/toggl2jira)

Simple tool for migrating Toggle time entries into Jira as work logs.

## Usage

`node index.js [--group] <toggl-api-key> <jira-url> <jira-api-key> <date>`

Options
- *--group* - enable grouping entries with the same description and tags

Parameters:
- *toggl-api-key*   - API key to your Toggl account
- *jira-url*     - Jira URL
- *jira-api-key* - API key to your Jira account
- *date*            - date in format *mm.dd.YYYY*, filters entries to given day

## Use with bash script

``` 
cp toggl.sh.example toggl.sh
# Fill toggl.sh file with toggl and redmine api keys and redmine url

sh toggl.sh mm.dd.yyyy    # with specific date
sh toggl.sh               # with current date
``` 
